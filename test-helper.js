/* eslint-env mocha */
const dashboard = require('@userappstore/dashboard')
const stripe = require('stripe')()
const util = require('util')

process.env.STRIPE_KEY = process.env.STRIPE_KEY || 'sk_test_HoN4G3zkt9WV91nfRtacpw8V'
process.env.NODE_ENV = 'testing'
const stripeKey = {api_key: process.env.STRIPE_KEY}

const TestHelper = module.exports = dashboard.loadTestHelper()
dashboard.setup(__dirname)
global.redisClient.select(4)

const createRequestWas = module.exports.createRequest
module.exports.createRequest = (rawURL, method) => {
  const req = createRequestWas(rawURL, method)
  req.stripeKey = stripeKey
  return req
}

module.exports.cancelSubscription = cancelSubscription
module.exports.createCard = createCard
module.exports.createCoupon = createCoupon
module.exports.createCustomer = createCustomer
module.exports.createCustomerDiscount = createCustomerDiscount
module.exports.createNextInvoice = createNextInvoice
module.exports.createPayout = createPayout
module.exports.createPlan = createPlan
module.exports.createProduct = createProduct
module.exports.createRefund = createRefund
module.exports.changeSubscription = changeSubscription
module.exports.createSubscription = createSubscription
module.exports.createSubscriptionDiscount = createSubscriptionDiscount
module.exports.changeSubscriptionWithoutPaying = changeSubscriptionWithoutPaying
module.exports.currentWebHookNumber = currentWebHookNumber
module.exports.flagCharge = flagCharge
module.exports.forgiveInvoice = forgiveInvoice
module.exports.loadCharge = loadCharge
module.exports.loadInvoice = loadInvoice
module.exports.payInvoice = payInvoice
module.exports.waitForWebhooks = util.promisify(waitForWebhooks)

beforeEach(setup)
let testNumber = 0
function setup (callback) {
  global.MINIMUM_COUPON_LENGTH = 1
  global.MAXIMUM_COUPON_LENGTH = 100
  global.MINIMUM_PLAN_LENGTH = 1
  global.MAXIMUM_PLAN_LENGTH = 100
  global.MINIMUM_PRODUCT_NAME_LENGTH = 1
  global.MAXIMUM_PRODUCT_NAME_LENGTH = 100
  global.MINIMUM_PRODUCT_ATTRIBUTE_LENGTH = 1
  global.MAXIMUM_PRODUCT_ATTRIBUTE_LENGTH = 100
  global.ORGANIZATION_FIELDS = [ 'name', 'email' ]
  global.MEMBERSHIP_FIELDS = [ 'name', 'email' ]
  global.MINIMUM_STRIPE_TIMESTAMP = dashboard.Timestamp.now
  global.PAGE_SIZE = 2
  testNumber++
  return global.redisClient.get('webhookNumber', (_, webhookNumber) => {
    return global.redisClient.flushdb(() => {
      return global.redisClient.incrby('testNumber', testNumber, () => {
        console.log('     # ' + testNumber)
        if (!webhookNumber) {
          return callback()
        }
        function wait () {
          return setTimeout(() => {
            return global.redisClient.get('webhookNumber', (_, webhookNumber) => {
              if (webhookNumber) {
                console.log(`--- caught webhook from previous test ${webhookNumber} ---`)
                return global.redisClient.flushdb(callback)
                // return process.exit(1)
              }
              return callback()
            })
          }, 30000)
        }
        return util.promisify(wait)()
      })
    })
  })
}

let productNumber = 0
async function createProduct (administrator, properties) {
  if (arguments.length > 2) {
    throw new Error('--- clean up createProduct call ---')
  }
  productNumber++
  const req = TestHelper.createRequest('/api/administrator/subscriptions/create-product', 'POST')
  req.administratorSession = req.session = administrator.session
  req.administratorAccount = req.account = administrator.account
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
  await req.route.api.post(req)
  req.administratorSession = req.session = await TestHelper.unlockSession(administrator)
  let product = await req.route.api.post(req)
  if (properties && properties.unpublished) {
    const req2 = TestHelper.createRequest(`/api/administrator/subscriptions/set-product-unpublished?productid=${product.id}`, 'PATCH')
    req2.administratorSession = req2.session = administrator.session
    req2.administratorAccount = req2.account = administrator.account
    await req2.route.api.patch(req2)
    req.session = await TestHelper.unlockSession(administrator)
    product = await req2.route.api.patch(req2)
  }
  administrator.session = await dashboard.Session.load(administrator.session.sessionid)
  if (administrator.session.lock || administrator.session.unlocked) {
    throw new Error('session status is locked or unlocked when it should be nothing')
  }
  administrator.product = product
  return product
}

let planNumber = 0
async function createPlan (administrator, properties) {
  if (arguments.length > 2) {
    throw new Error('--- clean up createPlan call ---')
  }
  planNumber++
  const req = TestHelper.createRequest('/api/administrator/subscriptions/create-plan', 'POST')
  req.administratorSession = req.session = administrator.session
  req.administratorAccount = req.account = administrator.account
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
  await req.route.api.post(req)
  req.session = await TestHelper.unlockSession(administrator)
  let plan = await req.route.api.post(req)
  if (properties && properties.unpublished) {
    const req2 = TestHelper.createRequest(`/api/administrator/subscriptions/set-plan-unpublished?planid=${plan.id}`, 'PATCH')
    req2.administratorSession = req2.session = administrator.session
    req2.administratorAccount = req2.account = administrator.account
    await req2.route.api.patch(req2)
    req.session = await TestHelper.unlockSession(administrator)
    plan = await req2.route.api.patch(req2)
  }
  administrator.plan = plan
  administrator.session = await dashboard.Session.load(administrator.session.sessionid)
  if (administrator.session.lock || administrator.session.unlocked) {
    throw new Error('session status is locked or unlocked when it should be nothing')
  }
  return plan
}

let couponNumber = 0
async function createCoupon (administrator, properties) {
  if (arguments.length > 2) {
    throw new Error('--- clean up createCoupon call ---')
  }
  couponNumber++
  const req = TestHelper.createRequest('/api/administrator/subscriptions/create-coupon', 'POST')
  req.administratorSession = req.session = administrator.session
  req.administratorAccount = req.account = administrator.account
  req.body = {
    couponid: `coupon${couponNumber}_` + new Date().getTime() + `_` + Math.ceil(Math.random() * 1000),
    percent_off: '25',
    duration: 'repeating',
    duration_in_months: '3'
  }
  if (properties) {
    for (const property in properties) {
      req.body[property] = properties[property].toString()
    }
  }
  await req.route.api.post(req)
  req.session = await TestHelper.unlockSession(administrator)
  let coupon = await req.route.api.post(req)
  if (properties && properties.unpublished) {
    const req2 = TestHelper.createRequest(`/api/administrator/subscriptions/set-coupon-unpublished?couponid=${coupon.id}`, 'PATCH')
    req2.administratorSession = req2.session = administrator.session
    req2.administratorAccount = req2.account = administrator.account
    await req2.route.api.patch(req2)
    req2.session = await TestHelper.unlockSession(administrator)
    coupon = await req2.route.api.patch(req2)
  }
  administrator.coupon = coupon
  administrator.session = await dashboard.Session.load(administrator.session.sessionid)
  if (administrator.session.lock || administrator.session.unlocked) {
    throw new Error('session status is locked or unlocked when it should be nothing')
  }
  return coupon
}

async function createRefund (administrator, charge) {
  if (arguments.length > 2) {
    throw new Error('--- clean up createRefund call ---')
  }
  const req = TestHelper.createRequest(`/api/administrator/subscriptions/create-refund?chargeid=${charge.id}`, 'POST')
  req.administratorSession = req.session = administrator.session
  req.administratorAccount = req.account = administrator.account
  req.body = {
    chargeid: charge.id,
    amount: charge.amount,
    reason: 'requested_by_customer'
  }
  await req.route.api.post(req)
  req.administratorSession = req.session = await TestHelper.unlockSession(administrator)
  const refund = await req.route.api.post(req)
  administrator.refund = refund
  administrator.session = await dashboard.Session.load(administrator.session.sessionid)
  if (administrator.session.lock || administrator.session.unlocked) {
    throw new Error('session status is locked or unlocked when it should be nothing')
  }
  return administrator.refund
}

async function createSubscriptionDiscount (administrator, subscription, coupon) {
  if (arguments.length > 3) {
    throw new Error('--- clean up createSubscriptionDiscount call ---')
  }
  const req = TestHelper.createRequest(`/api/administrator/subscriptions/set-subscription-coupon?subscriptionid=${subscription.id}`, 'PATCH')
  req.administratorSession = req.session = administrator.session
  req.administratorAccount = req.account = administrator.account
  req.body = {
    couponid: coupon.id
  }
  await req.route.api.patch(req)
  req.administratorSession = req.session = await TestHelper.unlockSession(administrator)
  const subscriptionNow = await req.route.api.patch(req)
  administrator.session = await dashboard.Session.load(administrator.session.sessionid)
  if (administrator.session.lock || administrator.session.unlocked) {
    throw new Error('session status is locked or unlocked when it should be nothing')
  }
  return subscriptionNow
}

async function createCustomerDiscount (administrator, customer, coupon) {
  if (arguments.length > 3) {
    throw new Error('--- clean up createCustomerDiscount call ---')
  }
  const req = TestHelper.createRequest(`/api/administrator/subscriptions/set-customer-coupon?customerid=${customer.id}`, 'PATCH')
  req.administratorSession = req.session = administrator.session
  req.administratorAccount = req.account = administrator.account
  req.body = {
    couponid: coupon.id
  }
  await req.route.api.patch(req)
  req.administratorSession = req.session = await TestHelper.unlockSession(administrator)
  const customerNow = await req.route.api.patch(req)
  administrator.session = await dashboard.Session.load(administrator.session.sessionid)
  if (administrator.session.lock || administrator.session.unlocked) {
    throw new Error('session status is locked or unlocked when it should be nothing')
  }
  return customerNow
}

async function createCustomer (user) {
  if (arguments.length > 2) {
    throw new Error('--- clean up createCustomer call ---')
  }
  const req = TestHelper.createRequest(`/api/user/subscriptions/create-customer?accountid=${user.account.accountid}`, 'POST')
  req.session = user.session
  req.account = user.account
  req.body = {
  }
  const customer = await req.route.api.post(req)
  user.customer = customer
  user.session = await dashboard.Session.load(user.session.sessionid)
  if (user.session.lock || user.session.unlocked) {
    throw new Error('session status is locked or unlocked when it should be nothing')
  }
  return user.customer
}

async function createCard (user, properties) {
  if (arguments.length > 2) {
    throw new Error('--- clean up createCard call ---')
  }
  const req = TestHelper.createRequest(`/api/user/subscriptions/create-card?customerid=${user.customer.id}`, 'POST')
  req.session = user.session
  req.account = user.account
  req.customer = user.customer
  req.body = {
    cvc: '111',
    number: '4111-1111-1111-1111',
    exp_month: '1',
    exp_year: (new Date().getFullYear() + 1).toString(),
    name: 'Tester',
    address_line1: 'Test address line 1',
    address_line2: 'Test address line 2',
    address_city: 'Test address city',
    address_state: 'California',
    address_zip: '90120',
    address_country: 'US',
    default: 'true'
  }
  if (properties) {
    for (const property in properties) {
      req.body[property] = properties[property].toString()
    }
  }
  await req.route.api.post(req)
  req.session = await TestHelper.unlockSession(user)
  const card = await req.route.api.post(req)
  user.customer = req.customer
  user.card = card
  user.session = await dashboard.Session.load(user.session.sessionid)
  if (user.session.lock || user.session.unlocked) {
    throw new Error('session status is locked or unlocked when it should be nothing')
  }
  return user.card
}

async function loadInvoice (user, subscriptionid) {
  if (arguments.length > 2) {
    throw new Error('--- clean up loadInvoice call ---')
  }
  const req = TestHelper.createRequest(`/api/user/subscriptions/subscription-invoices?subscriptionid=${subscriptionid}`, 'POST')
  req.session = user.session
  req.account = user.account
  req.customer = user.customer
  const invoices = await req.route.api.get(req)
  if (invoices && invoices.length) {
    const newest = invoices[0]
    user.invoice = newest
    return user.invoice
  }
}

async function loadCharge (user, subscriptionid) {
  if (arguments.length > 2) {
    throw new Error('--- clean up loadCharge call ---')
  }
  const req = TestHelper.createRequest(`/api/user/subscriptions/subscription-charges?subscriptionid=${subscriptionid}`, 'POST')
  req.session = user.session
  req.account = user.account
  req.customer = user.customer
  const charges = await req.route.api.get(req)
  if (charges && charges.length) {
    const newest = charges[0]
    user.charge = newest
    return user.charge
  }
}

async function changeSubscriptionWithoutPaying (user, planid) {
  if (arguments.length > 2) {
    throw new Error('--- clean up changeSubscriptionWithoutPaying call ---')
  }
  // the Stripe API has to be used here directly to cause the customer
  // to have an outstanding balance
  const subscriptionInfo = {
    items: [
      {
        quantity: 1, 
        plan: planid
      }
    ]
  }
  const subscription = await stripe.subscriptions.update(user.subscription.id, subscriptionInfo, stripeKey)
  user.subscription = subscription
  const invoiceInfo = {
    customer: user.customer.id
  }
  await stripe.invoices.create(invoiceInfo, stripeKey)
  return subscription
}

async function changeSubscription (user, planid) {
  if (arguments.length > 2) {
    throw new Error('--- clean up changeSubscription call ---')
  }
  const req = TestHelper.createRequest(`/api/user/subscriptions/set-subscription-plan?subscriptionid=${user.subscription.id}`, 'DELETE')
  req.session = user.session
  req.account = user.account
  req.customer = user.customer
  req.body = {planid}
  await req.route.api.patch(req)
  req.session = await TestHelper.unlockSession(user)
  const subscription = await req.route.api.patch(req)
  user.subscription = subscription
  user.session = await dashboard.Session.load(user.session.sessionid)
  if (user.session.lock || user.session.unlocked) {
    throw new Error('session status is locked or unlocked when it should be nothing')
  }
  const req2 = TestHelper.createRequest(`/api/user/subscriptions/upcoming-invoice?subscriptionid=${user.subscription.id}`, 'GET')
  req2.session = user.session
  req2.account = user.account
  req2.customer = user.customer
  const invoice = await req2.route.api.get(req2)
  const req3 = TestHelper.createRequest(`/api/user/subscriptions/set-invoice-paid?invoiceid=${invoice.id}`, 'PATCH')
  req3.session = user.session
  req3.account = user.account
  req3.customer = user.custome
  req3.body = {
    cardid: user.customer.default_source
  }
  await req3.route.api.patch(req3)
  req3.session = await TestHelper.unlockSession(user)
  await req3.route.api.patch(req3)
  return user.subscription
}


async function createSubscription (user, planid) {
  if (arguments.length > 2) {
    throw new Error('--- clean up createSubscription call ---')
  }
  const req = TestHelper.createRequest(`/api/user/subscriptions/create-subscription?planid=${planid}`, 'POST')
  req.session = user.session
  req.account = user.account
  req.customer = user.customer
  await req.route.api.post(req)
  req.session = await TestHelper.unlockSession(user)
  const subscription = await req.route.api.post(req)
  user.subscription = subscription
  user.session = await dashboard.Session.load(user.session.sessionid)
  if (user.session.lock || user.session.unlocked) {
    throw new Error('session status is locked or unlocked when it should be nothing')
  }
  return user.subscription
}

async function cancelSubscription (user, refund) {
  if (arguments.length > 2) {
    throw new Error('--- clean up cancelSubscription call ---')
  }
  const req = TestHelper.createRequest(`/api/user/subscriptions/delete-subscription?subscriptionid=${user.subscription.id}`, 'DELETE')
  req.session = user.session
  req.account = user.account
  req.customer = user.customer
  req.body = {
    refund: refund || 'refund'
  }
  await req.route.api.delete(req)
  req.session = await TestHelper.unlockSession(user)
  const subscription = await req.route.api.delete(req)
  user.subscription = subscription
  user.session = await dashboard.Session.load(user.session.sessionid)
  if (user.session.lock || user.session.unlocked) {
    throw new Error('session status is locked or unlocked when it should be nothing')
  }
  return user.subscription
}

async function forgiveInvoice (administrator, invoiceid) {
  if (arguments.length > 2) {
    throw new Error('--- clean up forgiveInvoice call ---')
  }
  const req = TestHelper.createRequest(`/api/administrator/subscriptions/set-invoice-forgiven?invoiceid=${invoiceid}`, 'PATCH')
  req.administratorSession = req.session = administrator.session
  req.administratorAccount = req.account = administrator.account
  await req.route.api.patch(req)
  req.administratorSession = req.session = await TestHelper.unlockSession(administrator)
  const invoice = await req.route.api.patch(req)
  administrator.session = await dashboard.Session.load(administrator.session.sessionid)
  if (administrator.session.lock || administrator.session.unlocked) {
    throw new Error('session status is locked or unlocked when it should be nothing')
  }
  return invoice
}

async function flagCharge (administrator, chargeid) {
  if (arguments.length > 2) {
    throw new Error('--- clean up flagCharge call ---')
  }
  const req = TestHelper.createRequest(`/api/administrator/subscriptions/set-charge-flagged?chargeid=${chargeid}`, 'PATCH')
  req.administratorSession = req.session = administrator.session
  req.administratorAccount = req.account = administrator.account
  await req.route.api.patch(req)
  req.administratorSession = req.session = await TestHelper.unlockSession(administrator)
  const charge = await req.route.api.patch(req)
  administrator.session = await dashboard.Session.load(administrator.session.sessionid)
  if (administrator.session.lock || administrator.session.unlocked) {
    throw new Error('session status is locked or unlocked when it should be nothing')
  }
  return charge
}

async function payInvoice (user, invoiceid) {
  if (arguments.length > 2) {
    throw new Error('--- clean up payInvoice call ---')
  }
  const req = TestHelper.createRequest(`/api/user/subscriptions/set-invoice-paid?invoiceid=${invoiceid}`, 'PATCH')
  req.session = user.session
  req.account = user.account
  req.customer = user.customer
  req.body = {
    cardid: user.card.id
  }
  await req.route.api.patch(req)
  req.session = await TestHelper.unlockSession(user)
  const invoice = await req.route.api.patch(req)
  return invoice
}

async function createNextInvoice (user, subscriptionid) {
  if (arguments.length > 2) {
    throw new Error('--- clean up createNextInvoice call ---')
  }
  const invoice = await stripe.invoices.create({customer: user.customer.id}, stripeKey)
  user.invoice = invoice
  return user
}

async function createPayout () {
  // the Stripe API has to be used here directly because this module
  // assumes payouts will be handled automatically so there aren't
  // any API endpoints to create payouts
  const chargeInfo = {
    amount: 2000,
    currency: 'usd',
    source: 'tok_bypassPending',
    description: 'Test charge'
  }
  await stripe.charges.create(chargeInfo, stripeKey)
  const payoutInfo = {
    amount: 400,
    currency: 'usd'
  }
  const payout = await stripe.payouts.create(payoutInfo, stripeKey)
  return payout
}

async function waitForWebhooks (target, callback) {
  const webhookNumber = await currentWebHookNumber()
  if (webhookNumber >= target) {
    return callback()
  }
  async function wait () {
    const webhookNumberNow = await currentWebHookNumber()
    if (webhookNumberNow >= target) {
      return callback()
    }
    return setTimeout(wait, 20)
  }
  return setTimeout(wait, 20)
}

async function currentWebHookNumber () {
  let webhookNumber = await global.redisClient.getAsync('webhookNumber')
  if (webhookNumber && webhookNumber.length) {
    webhookNumber = parseInt(webhookNumber, 10)
  } else {
    webhookNumber = 0
  }
  return webhookNumber
}
