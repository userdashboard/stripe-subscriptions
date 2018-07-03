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
module.exports.changeSubscription = changeSubscription
module.exports.changeSubscriptionWithoutPaying = changeSubscriptionWithoutPaying
module.exports.createCard = createCard
module.exports.createCoupon = createCoupon
module.exports.createCustomer = createCustomer
module.exports.createCustomerDiscount = createCustomerDiscount
module.exports.createNextInvoice = createNextInvoice
module.exports.createPayout = createPayout
module.exports.createPlan = createPlan
module.exports.createProduct = createProduct
module.exports.createRefund = createRefund
module.exports.createSubscription = createSubscription
module.exports.createSubscriptionDiscount = createSubscriptionDiscount
module.exports.currentWebHookNumber = currentWebHookNumber
module.exports.forgiveInvoice = forgiveInvoice
module.exports.loadCharge = loadCharge
module.exports.loadInvoice = loadInvoice
module.exports.payInvoice = payInvoice
module.exports.waitForWebhooks = util.promisify(waitForWebhooks)

beforeEach(setup)

async function setup () {
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
  global.redisClient.flushdb()
}

let productNumber = 0
async function createProduct (administrator, properties) {
  productNumber++
  const req = TestHelper.createRequest('/api/administrator/subscriptions/create-product', 'POST')
  req.administratorSession = req.session = administrator.session
  req.administratorAccount = req.account = administrator.account
  req.body = {
    name: `product${productNumber}-` + new Date().getTime() + '-' + Math.ceil(Math.random() * 1000),
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
  planNumber++
  const req = TestHelper.createRequest('/api/administrator/subscriptions/create-plan', 'POST')
  req.administratorSession = req.session = administrator.session
  req.administratorAccount = req.account = administrator.account
  req.body = {
    planid: `plan${planNumber} ` + new Date().getTime() + ' ' + Math.ceil(Math.random() * 100000),
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
  couponNumber++
  const req = TestHelper.createRequest('/api/administrator/subscriptions/create-coupon', 'POST')
  req.administratorSession = req.session = administrator.session
  req.administratorAccount = req.account = administrator.account
  req.body = {
    couponid: `coupon${couponNumber}` + new Date().getTime() + Math.ceil(Math.random() * 1000),
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
    await req.route.api.patch(req)
    req.session = await TestHelper.unlockSession(administrator)
    coupon = await req.route.api.patch(req)
  }
  administrator.coupon = coupon
  administrator.session = await dashboard.Session.load(administrator.session.sessionid)
  if (administrator.session.lock || administrator.session.unlocked) {
    throw new Error('session status is locked or unlocked when it should be nothing')
  }
  return coupon
}

async function createRefund (administrator, charge) {
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

async function createSubscription (user, planid) {
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

async function loadInvoice (user, subscriptionid) {
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
  // TODO: this needs to go through the API
  const subscriptionInfo = {
    items: [{
      plan: planid
    }]
  }
  const subscription = await stripe.subscriptions.update(user.subscription.id, subscriptionInfo, stripeKey)
  user.subscription = subscription
  user.invoice = await stripe.invoices.create({customer: user.customer.id}, stripeKey)
  return user.subscription
}

async function changeSubscription (user, planid) {
  // TODO: this needs to go through the API
  const subscriptionInfo = {
    items: [{
      plan: planid
    }]
  }
  const subscription = await stripe.subscriptions.update(user.subscription.id, subscriptionInfo, stripeKey)
  user.subscription = subscription
  const invoice = await stripe.invoices.create({customer: user.customer.id}, stripeKey)
  user.invoice = await stripe.invoices.pay(invoice.id, stripeKey)
  user.charge = await stripe.charges.retrieve(user.invoice.charge, stripeKey)
  return user.subscription
}

async function cancelSubscription (user) {
  const req = TestHelper.createRequest(`/api/user/subscriptions/cancel-subscription?subscriptionid=${user.subscription.id}`, 'POST')
  req.session = user.session
  req.account = user.account
  req.customer = user.customer
  req.body = {
    refund: 'refund'
  }
  await req.route.api.patch(req)
  req.session = await TestHelper.unlockSession(user)
  const subscription = await req.route.api.patch(req)
  user.subscription = subscription
  const invoice = await stripe.invoices.create({customer: user.customer.id}, stripeKey)
  user.invoice = await stripe.invoices.pay(invoice.id, stripeKey)
  user.charge = await stripe.charges.retrieve(user.invoice.charge, stripeKey)
  return user.subscription
}

async function forgiveInvoice (administrator, invoiceid) {
  const req = TestHelper.createRequest(`/api/administrator/subscriptions/set-invoice-forgiven?invoiceid=${invoiceid}`, 'POST')
  req.administratorSession = req.session = administrator.session
  req.administratorAccount = req.account = administrator.account
  await req.route.api.patch(req)
  req.administratorSession = req.session = await TestHelper.unlockSession(administrator)
  const invoice = await req.route.api.patch(req)
  return invoice
}

async function payInvoice (user, invoiceid) {
  const req = TestHelper.createRequest(`/api/user/subscriptions/set-invoice-paid?invoiceid=${invoiceid}`, 'POST')
  req.session = user.session
  req.account = user.account
  req.customer = user.customer
  req.body = {
    cardid: user.card.id
  }
  console.log(req.body, user)
  await req.route.api.patch(req)
  req.session = await TestHelper.unlockSession(user)
  const invoice = await req.route.api.patch(req)
  return invoice
}

async function createNextInvoice (user, subscriptionid) {
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
    return setTimeout(wait, 1000)
  }
  return setTimeout(wait, 100)
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
