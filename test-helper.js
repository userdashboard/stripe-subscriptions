/* eslint-env mocha */
process.env.NODE_ENV = 'testing'
process.env.SILENT_START = 'true'
process.env.ALLOW_PUBLIC_API = 'true'
process.env.PORT = 8000
process.env.APPID = 'app'

const dashboard = require('@userappstore/dashboard')
const stripe = require('stripe')()
const util = require('util')
const stripeKey = {
  api_key: process.env.STRIPE_KEY
}

const TestHelper = module.exports = dashboard.loadTestHelper()
dashboard.start(__dirname)

const createRequestWas = module.exports.createRequest
module.exports.createRequest = (rawURL, method) => {
  const req = createRequestWas(rawURL, method)
  req.appid = 'app'
  req.stripeKey = stripeKey
  return req
}

module.exports.cancelSubscription = cancelSubscription
module.exports.createCard = createCard
module.exports.createCoupon = createCoupon
module.exports.createCustomer = createCustomer
module.exports.createCustomerDiscount = createCustomerDiscount
module.exports.createPayout = createPayout
module.exports.createPlan = createPlan
module.exports.createProduct = createProduct
module.exports.createRefund = createRefund
module.exports.changeSubscription = changeSubscription
module.exports.createSubscription = createSubscription
module.exports.createSubscriptionDiscount = createSubscriptionDiscount
module.exports.changeSubscriptionWithoutPaying = changeSubscriptionWithoutPaying
module.exports.flagCharge = flagCharge
module.exports.forgiveInvoice = forgiveInvoice
module.exports.loadCharge = loadCharge
module.exports.payInvoice = payInvoice
module.exports.waitForNextItem = util.promisify(waitForNextItem)

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
}

after(() => {
  dashboard.stop()
})

let productNumber = 0
async function createProduct (administrator, properties) {
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
    req2.administratorSession = req2.session = req.session
    req2.administratorAccount = req2.account = req.account
    await req2.route.api.patch(req2)
    req2.administratorSession = req2.session = await TestHelper.unlockSession(administrator)
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
  req.administratorSession = req.session = await TestHelper.unlockSession(administrator)
  let plan = await req.route.api.post(req)
  req.administratorSession = req.session = await dashboard.Session.load(administrator.session.sessionid)
  if (properties && properties.unpublished) {
    const req2 = TestHelper.createRequest(`/api/administrator/subscriptions/set-plan-unpublished?planid=${plan.id}`, 'PATCH')
    req2.administratorSession = req2.session = req.session
    req2.administratorAccount = req2.account = req.account
    await req2.route.api.patch(req2)
    req2.administratorSession = req2.session = await TestHelper.unlockSession(administrator)
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
    req2.administratorSession = req2.session = req.session
    req2.administratorAccount = req2.account = req.account
    await req2.route.api.patch(req2)
    req2.administratorSession = req2.session = await TestHelper.unlockSession(administrator)
    coupon = await req2.route.api.patch(req2)
  }
  administrator.coupon = coupon
  administrator.session = await dashboard.Session.load(administrator.session.sessionid)
  if (administrator.session.lock || administrator.session.unlocked) {
    throw new Error('session status is locked or unlocked when it should be nothing')
  }
  return coupon
}

async function createRefund (administrator, chargeid) {
  const req = TestHelper.createRequest(`/api/administrator/subscriptions/charge?chargeid=${chargeid}`, 'GET')
  req.administratorSession = req.session = administrator.session
  req.administratorAccount = req.account = administrator.account
  const charge = await req.route.api.get(req)
  const req2 = TestHelper.createRequest(`/api/administrator/subscriptions/create-refund?chargeid=${charge.id}`, 'POST')
  req2.administratorSession = req2.session = req.session
  req2.administratorAccount = req2.account = req.account
  req2.body = {
    chargeid: charge.id,
    amount: charge.amount,
    reason: 'requested_by_customer'
  }
  await req2.route.api.post(req2)
  req2.administratorSession = req2.session = await TestHelper.unlockSession(administrator)
  const refund = await req2.route.api.post(req2)
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

async function loadCharge (user, chargeid) {
  const req = TestHelper.createRequest(`/api/user/subscriptions/charge?chargeid=${chargeid}`, 'GET')
  req.session = user.session
  req.account = user.account
  req.customer = user.customer
  const charge = await req.route.api.get(req)
  chargeid = charge
  return charge
}

async function changeSubscriptionWithoutPaying (user, planid) {
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
  return user.subscription
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

async function cancelSubscription (user, refund) {
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

async function createPayout () {
  // The Stripe API has to be used here directly because this module
  // assumes payouts will be handled automatically so there aren't
  // any API endpoints to create payouts.
  //
  // For the payout to be created you must attach a test bank account
  // inside the Stripe dashboard for the account of your API key:
  // currency: 'usd'
  // country: 'US'
  // account_holder_name: 'Person'
  // account_type: 'individual'
  // account_number: '000123456789'
  // routing_number: '110000000'
  const chargeInfo = {
    amount: 1000,
    currency: 'usd',
    source: 'tok_bypassPending',
    description: 'Payout charge'
  }
  await stripe.charges.create(chargeInfo, stripeKey)
  const payoutInfo = {
    amount: 100,
    currency: 'usd',
    metadata: {
      testNumber: global.testNumber
    }
  }
  const payout = await stripe.payouts.create(payoutInfo, stripeKey)
  return payout
}

async function waitForNextItem (collection, previousid, callback) {
  callback = callback || previousid
  if (callback === previousid) {
    previousid = null
  }
  async function wait () {
    const itemids = await dashboard.RedisList.list(`app:${collection}`, 0, 1)
    if (!itemids || !itemids.length) {
      return setTimeout(wait, 10)
    }
    if (previousid && previousid === itemids[0]) {
      return setTimeout(wait, 10)
    }
    return setTimeout(() => {
      callback(null, itemids[0])
    }, 10)
  }
  return setTimeout(wait, 20)
}
