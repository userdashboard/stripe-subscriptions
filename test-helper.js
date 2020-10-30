/* eslint-env mocha */
global.applicationPath = global.applicationPath || __dirname
global.stripeAPIVersion = '2020-03-02'
global.maximumStripeRetries = 0
global.testConfiguration = global.testConfiguration || {}
global.testConfiguration.requireSubscription = false
global.testConfiguration.requirePayment = false
global.testConfiguration.requirePaymentConfirmation = false
global.testConfiguration.stripeJS = false
global.testConfiguration.startSubscriptionPath = '/account/subscriptions/start-subscription'
global.testConfiguration.subscriptionRefundPeriod = 7 * 24 * 60 * 60
global.testConfiguration.minimumCouponLength = 1
global.testConfiguration.maximumCouponLength = 100
global.testConfiguration.minimumPlanIDLength = 1
global.testConfiguration.maximumPlanIDLength = 100
global.testConfiguration.minimumProductNameLength = 1
global.testConfiguration.maximumProductNameLength = 100

const fs = require('fs')
const Log = require('@userdashboard/dashboard/src/log.js')('stripe-subscriptions')
Log.info('embedding test helper')
const packageJSON = require('./package.json')
const path = require('path')
const stripe = require('stripe')()
stripe.setApiVersion(global.stripeAPIVersion)
if (global.maxmimumStripeRetries) {
  stripe.setMaxNetworkRetries(global.maximumStripeRetries)
}
stripe.setAppInfo({
  version: packageJSON.version,
  name: '@userdashboard/stripe-subscriptions (test suite)',
  url: 'https://github.com/userdashboard/stripe-subscriptions'
})
const util = require('util')
const TestHelper = require('@userdashboard/dashboard/test-helper.js')

let eventFolderPath = path.join(__dirname, '/src/www/webhooks/subscriptions/stripe-webhooks')
if (!fs.existsSync(eventFolderPath)) {
  eventFolderPath = path.join(__dirname, '/node_modules/@userdashboard/stripe-subscriptions/src/www/webhooks/subscriptions/stripe-webhook')
}
const events = fs.readdirSync(eventFolderPath)
const eventList = []
for (const event of events) {
  eventList.push(event.substring(0, event.indexOf('.js')))
}

let ngrok, publicIP, localTunnel, localhostRun
if (process.env.NGROK) {
  ngrok = require('ngrok')
} else if (process.env.PUBLIC_IP) {
  publicIP = require('public-ip')
} else if (process.env.LOCAL_TUNNEL) {
  localTunnel = require('localtunnel')
}

const stripeKey = {
  api_key: process.env.STRIPE_KEY
}

const wait = util.promisify((time, callback) => {
  if (time && !callback) {
    callback = time
    time = 100
  }
  return setTimeout(callback, time)
})

const waitForWebhook = util.promisify(async (webhookType, matching, callback) => {
  Log.info('waitForWebhook', webhookType)
  if (!webhook) {
    return callback()
  }
  async function wait () {
    if (global.testEnded) {
      return
    }
    if (!global.webhooks || !global.webhooks.length) {
      return setTimeout(wait, 10)
    }
    for (const received of global.webhooks) {
      if (received.type !== webhookType) {
        continue
      }
      if (matching(received)) {
        return callback()
      }
    }
    return setTimeout(wait, 10)
  }
  return setTimeout(wait, 10)
})

const waitForEitherWebhook = util.promisify(async (webhookType1, webhookType2, matching, callback) => {
  Log.info('waitForEitherWebhook', webhookType1, webhookType2)
  if (!webhook) {
    return callback()
  }
  async function wait () {
    if (global.testEnded) {
      return
    }
    if (!global.webhooks || !global.webhooks.length) {
      return setTimeout(wait, 10)
    }
    for (const received of global.webhooks) {
      if (received.type !== webhookType1 && received.type !== webhookType2) {
        continue
      }
      if (matching(received)) {
        return callback()
      }
    }
    return setTimeout(wait, 10)
  }
  return setTimeout(wait, 10)
})

module.exports = {
  cancelSubscription,
  createAmountOwed,
  createPaymentMethod,
  createPaymentIntent,
  createSetupIntent,
  createCoupon,
  createCustomer,
  createCustomerDiscount,
  createPayout,
  createPlan,
  createProduct,
  createRefund,
  changeSubscription,
  changeSubscriptionQuantity,
  createSubscription,
  createSubscriptionDiscount,
  deleteCustomerDiscount,
  deleteOldWebhooks,
  deleteSubscription,
  deleteSubscriptionDiscount,
  denyRefund,
  flagCharge,
  forgiveInvoice,
  toggleRefunds,
  toggleOverdueInvoiceThreshold,
  requestRefund,
  waitForWebhook,
  setupWebhook,
  setupBefore
}

for (const x in TestHelper) {
  module.exports[x] = TestHelper[x]
}

module.exports.wait = wait
const createRequest = module.exports.createRequest = (rawURL) => {
  const req = TestHelper.createRequest(rawURL)
  req.stripeKey = stripeKey
  return req
}

let tunnel, webhook, data

// direct webhook access is set up before the tests a single time
async function setupBefore () {
  Log.info('setting up before')
  await deleteOldWebhooks()
  const helperRoutes = require('./test-helper-routes.js')
  global.sitemap['/api/create-fake-payout'] = helperRoutes.createFakePayout
  global.sitemap['/api/fake-amount-owed'] = helperRoutes.fakeAmountOwed
  global.sitemap['/api/toggle-refunds'] = helperRoutes.toggleRefunds
  global.sitemap['/api/toggle-overdue-invoice-threshold'] = helperRoutes.toggleOverdueInvoiceThreshold
  // TODO: when third-party forwarders like ngrok are used there can be
  // too many requests per minute from accumulated events so the webhooks
  // may be created and destroyed for each test or once and reused
  if (process.env.PUBLIC_IP || process.env.TEST_SUITE_REUSABLE_WEBHOOK) {
    await setupWebhook()
  }
}

async function setupWebhook () {
  Log.info('Setting up webhook')
  if (webhook) {
    return
  }
  let newAddress
  if (process.env.NGROK) {
    if (ngrok) {
      ngrok.kill()
    }
    tunnel = null
    while (!tunnel) {
      try {
        tunnel = await ngrok.connect({
          port: global.port,
          auth: process.env.NGROK_AUTH
        })
        if (!tunnel) {
          continue
        }
        newAddress = tunnel
        break
      } catch (error) {
        continue
      }
    }
  } else if (process.env.PUBLIC_IP) {
    const ip = await publicIP.v4()
    newAddress = `http://${ip}:${global.port}`
  } else if (process.env.LOCAL_TUNNEL) {
    if (tunnel) {
      tunnel.close()
    }
    tunnel = await localTunnel({
      port: global.port,
      local_https: false,
      host: 'http://localtunnel.me'
    })
    newAddress = tunnel.url
  } else if (process.env.LOCALHOST_RUN) {
    if (localhostRun) {
      localhostRun.stdin.pause()
      localhostRun.kill()
    }
    const asyncLocalHostRun = util.promisify(createLocalHostRun)
    const url = await asyncLocalHostRun()
    newAddress = url
  } else {
    newAddress = global.dashboardServer
  }
  if (newAddress) {
    webhook = await stripe.webhookEndpoints.create({
      url: `${newAddress}/webhooks/subscriptions/index-subscription-data`,
      enabled_events: eventList
    }, stripeKey)
    global.subscriptionWebhookEndPointSecret = webhook.secret
    Log.info('created webhook', webhook)
  }
}

before(deleteOldData)
before(setupBefore)

afterEach(async () => {
  if (data) {
    await deleteOldData()
    data = false
  }
})

after(async () => {
  if (data) {
    await deleteOldData()
    data = false
  }
  if (webhook) {
    await deleteOldWebhooks()
    webhook = null
  }
  if (process.env.NGROK) {
    if (ngrok) {
      ngrok.kill()
    }
  } else if (process.env.LOCAL_TUNNEL) {
    if (tunnel) {
      tunnel.close()
    }
  } else if (process.env.LOCALHOST_RUN) {
    if (localhostRun) {
      localhostRun.stdin.pause()
      localhostRun.kill()
    }
  }
  delete (global.rootPath)
  delete (global.packageJSON)
  delete (global.sitemap)
  delete (global.api)
  delete (global.testEnded)
})

async function deleteOldWebhooks () {
  webhook = null
  let webhooks = await stripe.webhookEndpoints.list(stripeKey)
  let errors = 0
  while (webhooks.data && webhooks.data.length) {
    for (const webhook of webhooks.data) {
      if (webhook === 0) {
        continue
      }
      try {
        await stripe.webhookEndpoints.del(webhook.id, stripeKey)
      } catch (error) {
        Log.error('error deleting old data', error)
        errors++
        if (errors > 10) {
          return process.exit(1)
        }
      }
    }
    try {
      webhooks = await stripe.webhookEndpoints.list(stripeKey)
    } catch (error) {
      webhooks = { data: [0] }
    }
  }
}

async function deleteOldData () {
  for (const field of ['subscriptions', 'customers', 'plans', 'products', 'coupons']) {
    let objects
    let errors = 0
    while (true) {
      try {
        objects = await stripe[field].list(stripeKey)
        break
      } catch (error) {
        Log.error('error fetching old data', error)
        errors++
        if (errors > 10) {
          return process.exit(1)
        }
      }
    }
    errors = 0
    while (objects.data && objects.data.length) {
      for (const object of objects.data) {
        if (object === 0) {
          continue
        }
        try {
          await stripe[field].del(object.id, stripeKey)
        } catch (error) {
          Log.error('error deleting old data', error)
          errors++
          if (errors > 10) {
            return process.exit(1)
          }
        }
      }
      try {
        objects = await stripe[field].list(stripeKey)
      } catch (error) {
        objects = { data: [0] }
      }
    }
  }
}

function createLocalHostRun (callback) {
  const spawn = require('child_process').spawn
  localhostRun = spawn('ssh', ['-T', '-o', 'StrictHostKeyChecking=no', '-R', '80:localhost:' + global.port, 'ssh.localhost.run'])
  localhostRun.stdout.once('data', async (log) => {
    const url = log.toString().split(' ').pop().trim()
    return callback(null, url)
  })
  localhostRun.stderr.on('error', async (log) => {
    Log.error('webhook forwarding error', log.toString())
  })
}

let productNumber = 0
async function createProduct (administrator, properties) {
  data = true
  productNumber++
  const req = createRequest('/api/administrator/subscriptions/create-product')
  req.session = administrator.session
  req.account = administrator.account
  req.body = {
    name: `product${productNumber}_` + new Date().getTime() + '_' + Math.ceil(Math.random() * 1000),
    statement_descriptor: `product${productNumber} description`,
    unit_label: 'thing'
  }
  if (properties) {
    for (const property in properties) {
      req.body[property] = properties[property].toString()
    }
  }
  let product = await req.post()
  if (properties && properties.unpublished) {
    const req2 = createRequest(`/api/administrator/subscriptions/set-product-unpublished?productid=${product.id}`)
    req2.session = req.session
    req2.account = req.account
    product = await req2.patch(req2)
  }
  administrator.product = product
  return product
}

let planNumber = 0
async function createPlan (administrator, properties) {
  planNumber++
  const req = createRequest('/api/administrator/subscriptions/create-plan')
  req.session = administrator.session
  req.account = administrator.account
  req.body = {
    planid: `plan${planNumber}_` + new Date().getTime() + '_' + Math.ceil(Math.random() * 100000),
    currency: 'USD',
    interval: 'month',
    interval_count: '1',
    amount: '0'
  }
  if (properties) {
    for (const property in properties) {
      req.body[property] = properties[property].toString()
    }
  }
  let plan = await req.post()
  if (properties && properties.unpublished) {
    const req2 = createRequest(`/api/administrator/subscriptions/set-plan-unpublished?planid=${plan.id}`)
    req2.session = req.session
    req2.account = req.account
    plan = await req2.patch(req2)
  }
  administrator.plan = plan
  return plan
}

let couponNumber = 0
async function createCoupon (administrator, properties) {
  couponNumber++
  const req = createRequest('/api/administrator/subscriptions/create-coupon')
  req.session = administrator.session
  req.account = administrator.account
  req.body = {
    couponid: `coupon${couponNumber}_` + new Date().getTime() + '_' + Math.ceil(Math.random() * 1000),
    percent_off: '25',
    duration: 'repeating',
    duration_in_months: '3'
  }
  if (properties) {
    for (const property in properties) {
      req.body[property] = properties[property].toString()
    }
  }
  let coupon = await req.post()
  if (properties && properties.unpublished) {
    const req2 = createRequest(`/api/administrator/subscriptions/set-coupon-unpublished?couponid=${coupon.id}`)
    req2.session = req.session
    req2.account = req.account
    coupon = await req2.patch(req2)
  }
  administrator.coupon = coupon
  return coupon
}

async function createRefund (administrator, chargeid) {
  const req = createRequest(`/api/administrator/subscriptions/charge?chargeid=${chargeid}`)
  req.session = administrator.session
  req.account = administrator.account
  const charge = await req.get()
  const req2 = createRequest(`/api/administrator/subscriptions/create-refund?chargeid=${charge.id}`)
  req2.session = req.session
  req2.account = req.account
  req2.body = {
    chargeid: charge.id,
    amount: charge.amount - (charge.amount_refunded || 0),
    reason: 'requested_by_customer'
  }
  const refund = await req2.post(req2)
  await waitForWebhook('charge.refunded', (stripeEvent) => {
    return stripeEvent.data.object.id === chargeid
  })
  administrator.refund = refund
  return administrator.refund
}

async function createSubscriptionDiscount (administrator, subscription, coupon) {
  const req = createRequest(`/api/administrator/subscriptions/set-subscription-coupon?subscriptionid=${subscription.id}`)
  req.session = administrator.session
  req.account = administrator.account
  req.body = {
    couponid: coupon.id
  }
  const subscriptionNow = await req.patch()
  await waitForWebhook('customer.discount.created', (stripeEvent) => {
    return stripeEvent.data.object.customer === subscription.customer.id ||
           stripeEvent.data.object.customer === subscription.customer
  })
  await waitForWebhook('customer.subscription.updated', (stripeEvent) => {
    return stripeEvent.data.object.id === subscription.id
  })
  return subscriptionNow
}

async function deleteSubscriptionDiscount (administrator, subscription, coupon) {
  const req = createRequest(`/api/administrator/subscriptions/reset-subscription-coupon?subscriptionid=${subscription.id}`)
  req.session = administrator.session
  req.account = administrator.account
  req.body = {
    couponid: coupon.id
  }
  const subscriptionNow = await req.patch()
  return subscriptionNow
}

async function createCustomerDiscount (administrator, customer, coupon) {
  const req = createRequest(`/api/administrator/subscriptions/set-customer-coupon?customerid=${customer.id}`)
  req.session = administrator.session
  req.account = administrator.account
  req.body = {
    couponid: coupon.id
  }
  const customerNow = await req.patch()
  await waitForWebhook('customer.discount.created', (stripeEvent) => {
    return stripeEvent.data.object.customer === customer.id
  })
  return customerNow
}

async function deleteCustomerDiscount (administrator, customer, coupon) {
  const req = createRequest(`/api/administrator/subscriptions/reset-customer-coupon?customerid=${customer.id}`)
  req.session = administrator.session
  req.account = administrator.account
  req.body = {
    couponid: coupon.id
  }
  const customerNow = await req.patch()
  return customerNow
}

async function createCustomer (user, properties) {
  data = true
  const req = createRequest(`/api/user/subscriptions/create-customer?accountid=${user.account.accountid}`)
  req.session = user.session
  req.account = user.account
  req.body = properties
  user.customer = await req.post()
  await waitForWebhook('customer.created', (stripeEvent) => {
    return stripeEvent.data.object.id === user.customer.id
  })
  return user.customer
}

async function createSetupIntent (user, properties) {
  const req = createRequest(`/api/user/subscriptions/create-setup-intent?customerid=${user.customer.id}`)
  req.account = user.account
  req.session = user.session
  req.body = properties
  user.setupIntent = await req.post()
  return user.setupIntent
}
async function createPaymentIntent (user, properties) {
  const req = createRequest(`/api/user/subscriptions/create-payment-intent?customerid=${user.customer.id}`)
  req.account = user.account
  req.session = user.session
  req.body = properties
  user.paymentIntent = await req.post()
  await waitForWebhook('payment_intent.created', (stripeEvent) => {
    return stripeEvent.data.object.id === user.paymentIntent.id
  })
  return user.paymentIntent
}

async function createPaymentMethod (user, properties) {
  const req = createRequest(`/api/user/subscriptions/create-payment-method?customerid=${user.customer.id}`)
  req.account = user.account
  req.session = user.session
  req.body = properties
  user.paymentMethod = await req.post()
  if (properties.default === 'true') {
    await waitForWebhook('customer.updated', (stripeEvent) => {
      return stripeEvent.data.object.id === user.customer.id &&
             stripeEvent.data.object.invoice_settings.default_payment_method === user.paymentMethod.id
    })
    await waitForWebhook('payment_method.attached', (stripeEvent) => {
      return stripeEvent.data.object.id === user.paymentMethod.id
    })
    await waitForWebhook('setup_intent.created', (stripeEvent) => {
      if (stripeEvent.data.object.payment_method === user.paymentMethod.id) {
        user.setupIntent = stripeEvent.data.object
        return true
      }
    })
  }
  return user.paymentMethod
}

async function createAmountOwed (user, dueDate) {
  const req = createRequest(`/api/fake-amount-owed?customerid=${user.customer.id}&due_date=${dueDate || 0}`)
  req.session = user.session
  req.account = user.account
  user.invoice = await req.get()
  const req2 = createRequest(`/api/user/subscriptions/invoices?accountid=${user.account.accountid}`)
  req2.session = user.session
  req2.account = user.account
  req2.stripeKey = stripeKey
  while (true) {
    const invoices = await req2.route.api.get(req2)
    if (!invoices || !invoices.length) {
      await wait()
      continue
    }
    for (const invoice of invoices) {
      if (user.invoice.id === invoice.id) {
        return user.invoice
      }
    }
    await wait()
  }
}

async function changeSubscription (user, planid) {
  const req = createRequest(`/api/user/subscriptions/set-subscription-plan?subscriptionid=${user.subscription.id}`)
  req.session = user.session
  req.account = user.account
  req.body = {
    planid
  }
  if (user.paymentMethod) {
    req.body.paymentmethodid = user.paymentMethod.id
  }
  user.subscription = await req.patch()
  await waitForWebhook('customer.subscription.updated', (stripeEvent) => {
    return stripeEvent.data.object.plan.id === planid
  })
  await waitForWebhook('invoice.created', (stripeEvent) => {
    if (stripeEvent.data.object.id !== user.invoice.id &&
        stripeEvent.data.object.subscription === user.subscription.id &&
        stripeEvent.data.object.lines.data[stripeEvent.data.object.lines.data.length - 1].plan.id === planid) {
      user.invoice = stripeEvent.data.object
      return true
    }
  })
  if (user.invoice.amount_due && !user.invoice.charge) {
    await waitForWebhook('charge.succeeded', (stripeEvent) => {
      if (stripeEvent.data.object.id === user.invoice.charge) {
        user.charge = stripeEvent.data.object
        return true
      }
    })
  }
  return user.subscription
}

async function changeSubscriptionQuantity (user, quantity) {
  const req = createRequest(`/api/user/subscriptions/set-subscription-quantity?subscriptionid=${user.subscription.id}`)
  req.session = user.session
  req.account = user.account
  req.body = {
    quantity
  }
  if (user.paymentMethod) {
    req.body.paymentmethodid = user.paymentMethod.id
  }
  user.subscription = await req.patch()
  await waitForWebhook('customer.subscription.updated', (stripeEvent) => {
    return stripeEvent.data.object.quantity === quantity
  })
  if (user.subscription.current_period_end && !user.subscription.trial_end) {
    await waitForWebhook('invoice.created', (stripeEvent) => {
      if (stripeEvent.data.object.id !== user.invoice.id &&
        stripeEvent.data.object.subscription === user.subscription.id &&
        stripeEvent.data.object.lines.data[stripeEvent.data.object.lines.data.length - 1].quantity === quantity) {
        user.invoice = stripeEvent.data.object
        return true
      }
    })
    if (user.invoice.charge) {
      await waitForWebhook('charge.succeeded', (stripeEvent) => {
        return stripeEvent.data.object.id === user.invoice.charge
      })
      await waitForWebhook('charge.updated', (stripeEvent) => {
        if (stripeEvent.data.object.id === user.invoice.charge) {
          user.charge = stripeEvent.data.object
          return true
        }
      })
    }
  }
  return user.subscription
}

async function createSubscription (user, planid) {
  const req = createRequest(`/api/user/subscriptions/create-subscription?customerid=${user.customer.id}`)
  req.session = user.session
  req.account = user.account
  req.body = {
    planid
  }
  if (user.paymentMethod) {
    req.body.paymentmethodid = user.paymentMethod.id
  }
  user.subscription = await req.post()
  await waitForWebhook('invoice.created', (stripeEvent) => {
    if (stripeEvent.data.object.id === user.subscription.latest_invoice) {
      user.invoice = stripeEvent.data.object
      return true
    }
  })
  if (user.subscription.plan.amount && !user.subscription.trial_end && user.subscription.plan.usage_type !== 'metered') {
    await waitForWebhook('payment_intent.created', (stripeEvent) => {
      return stripeEvent.data.object.invoice === user.invoice.id
    })
  }
  if (user.invoice.amount_due) {
    await waitForEitherWebhook('charge.succeeded', 'invoice.payment_action_required', (stripeEvent) => {
      if (stripeEvent.data.object.id === user.invoice.charge ||
          stripeEvent.data.object.id === user.invoice.id) {
        if (stripeEvent.type === 'charge.succeeded') {
          user.charge = stripeEvent.data.object
        }
        return true
      }
    })
    if (user.charge) {
      await waitForWebhook('charge.updated', (stripeEvent) => {
        if (stripeEvent.data.object.invoice === user.invoice.id) {
          user.charge = stripeEvent.data.object
          return true
        }
      })
    } else {
      await waitForWebhook('payment_intent.created', (stripeEvent) => {
        if (stripeEvent.data.object.invoice === user.invoice.id) {
          user.paymentIntent = stripeEvent.data.object
          return true
        }
      })
    }
  }
  return user.subscription
}

async function cancelSubscription (user) {
  const req = createRequest(`/api/user/subscriptions/set-subscription-canceled?subscriptionid=${user.subscription.id}`)
  req.session = user.session
  req.account = user.account
  req.stripeKey = stripeKey
  const subscription = await req.patch()
  await waitForEitherWebhook('customer.subscription.deleted', 'customer.subscription.updated', (stripeEvent) => {
    return stripeEvent.data.object.id === user.subscription.id &&
           stripeEvent.data.object.canceled_at
  })
  req.query.customerid = user.customer.id
  user.customer = await global.api.user.subscriptions.Customer.get(req)
  user.subscription = subscription
  return user.subscription
}

async function deleteSubscription (user, refund) {
  if (refund) {
    const req = createRequest(`/api/user/subscriptions/create-cancelation-refund?subscriptionid=${user.subscription.id}`)
    req.session = user.session
    req.account = user.account
    const object = await req.post()
    user.refund = object
    await waitForWebhook('charge.refunded', (stripeEvent) => {
      return stripeEvent.data.object.id === user.refund.charge
    })
  }
  const req2 = createRequest(`/api/user/subscriptions/delete-subscription?subscriptionid=${user.subscription.id}`)
  req2.session = user.session
  req2.account = user.account
  const subscription = await req2.delete()
  await waitForWebhook('customer.subscription.deleted', (stripeEvent) => {
    return stripeEvent.data.object.id === user.subscription.id
  })
  req2.query.customerid = user.customer.id
  req2.stripeKey = stripeKey
  user.customer = await global.api.user.subscriptions.Customer.get(req2)
  user.subscription = subscription
  return user.subscription
}

async function forgiveInvoice (administrator, invoiceid) {
  const req = createRequest(`/api/administrator/subscriptions/set-invoice-uncollectible?invoiceid=${invoiceid}`)
  req.session = administrator.session
  req.account = administrator.account
  const invoice = await req.patch()
  await waitForWebhook('invoice.updated', (stripeEvent) => {
    return stripeEvent.data.object.id === invoice.id
  })
  if (invoice.subscription) {
    await waitForWebhook('customer.subscription.updated', (stripeEvent) => {
      return stripeEvent.data.object.id !== invoice.id
    })
  }
  return invoice
}

async function denyRefund (administrator, user, chargeid) {
  const req = createRequest(`/api/administrator/subscriptions/set-refund-request-denied?chargeid=${chargeid}`)
  req.session = administrator.session
  req.account = administrator.account
  req.body = {
    reason: 'refund denied'
  }
  user.charge = await req.patch()
  await waitForWebhook('charge.updated', (stripeEvent) => {
    return stripeEvent.data.object.id === user.charge.id
  })
  return user.charge
}

async function requestRefund (user, chargeid) {
  const req = createRequest(`/api/user/subscriptions/create-refund-request?chargeid=${chargeid}`)
  req.session = user.session
  req.account = user.account
  req.body = {
    reason: 'unused subscription'
  }
  user.charge = await req.post()
  await waitForWebhook('charge.updated', (stripeEvent) => {
    return stripeEvent.data.object.id === chargeid
  })
  return user.charge
}

async function flagCharge (administrator, chargeid) {
  const req = createRequest(`/api/administrator/subscriptions/set-charge-flagged?chargeid=${chargeid}`)
  req.session = administrator.session
  req.account = administrator.account
  const charge = await req.patch()
  await waitForWebhook('charge.updated', (stripeEvent) => {
    return stripeEvent.data.object.id === charge.id
  })
  return charge
}

async function createPayout (administrator) {
  const req = createRequest('/api/create-fake-payout')
  req.session = administrator.session
  req.account = administrator.account
  const payout = await req.get()
  const req2 = createRequest('/api/administrator/subscriptions/payouts?limit=1')
  req2.session = administrator.session
  req2.account = administrator.account
  req2.stripeKey = stripeKey
  while (true) {
    const payouts = await req2.route.api.get(req2)
    if (!payouts || !payouts.length) {
      await wait()
      continue
    }
    if (administrator.payout && administrator.payout.id === payouts[0].id) {
      await wait()
      continue
    }
    administrator.payout = payouts[0]
    break
  }
  return payout
}

async function toggleRefunds (user, enable) {
  const req = createRequest(`/api/toggle-refunds?enable=${enable || ''}`)
  req.session = user.session
  req.account = user.account
  return req.get(req)
}

async function toggleOverdueInvoiceThreshold (user, enable) {
  const req = createRequest(`/api/toggle-overdue-invoice-threshold?enable=${enable || ''}`)
  await req.get()
}
