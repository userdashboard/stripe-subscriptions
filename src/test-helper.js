/* eslint-env mocha */
process.env.STRIPE_KEY = process.env.STRIPE_KEY || 'sk_test_HoN4G3zkt9WV91nfRtacpw8V'
process.env.NODE_ENV = 'testing'

const dashboard = require('@userappstore/dashboard')
const path = require('path')
const stripe = require('stripe')()
const stripeKey = {api_key: process.env.STRIPE_KEY}

module.exports = dashboard.loadTestHelper()
dashboard.setup(path.join(__dirname, '..'))
global.redisClient.select(4)

const createRequestWas = module.exports.createRequest
module.exports.createRequest = (rawURL, method) => {
  const req = createRequestWas(rawURL, method)
  req.stripeKey = stripeKey
  return req
}

module.exports.changeSubscription = changeSubscription
module.exports.createCard = createCard
module.exports.createCoupon = createCoupon
module.exports.createCustomer = createCustomer
module.exports.createCustomerDiscount = createCustomerDiscount
module.exports.createSubscriptionDiscount = createSubscriptionDiscount
module.exports.createPlan = createPlan
module.exports.createProduct = createProduct
module.exports.createRefund = createRefund
module.exports.createSubscription = createSubscription

before(setup)
beforeEach(setup)

function setup () {
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
}

let productNumber = 0
async function createProduct (existingUser, properties) {
  productNumber++
  const user = existingUser || await module.exports.createUser()
  const productInfo = {
    type: 'service',
    name: `product${productNumber}-` + new Date().getTime() + '-' + Math.ceil(Math.random() * 1000),
    statement_descriptor: `product${productNumber} description`,
    metadata: { }
  }
  if (properties) {
    for (const property in properties) {
      productInfo.metadata[property] = properties[property]
    }
  }
  const product = await stripe.products.create(productInfo, stripeKey)
  user.product = product
  return product
}

let planNumber = 0
async function createPlan (existingUser, properties, displayProperties, amount, freePeriod) {
  planNumber++
  const user = existingUser || await module.exports.createUser()
  await createProduct(user, properties)
  const planInfo = {
    id: `plan${planNumber}_` + new Date().getTime() + '-' + Math.ceil(Math.random() * 1000),
    currency: 'USD',
    amount: amount === 0 ? 0 : amount || 1000,
    product: user.product.id,
    interval: 'month',
    interval_count: 1,
    trial_period_days: freePeriod !== null ? freePeriod : 7,
    metadata: {}
  }
  if (properties) {
    for (const property in properties) {
      planInfo.metadata[property] = properties[property]
    }
  }
  if (displayProperties) {
    for (const property in displayProperties) {
      planInfo.metadata.display[property] = displayProperties[property]
    }
  }
  planInfo.metadata.display = JSON.stringify(planInfo.metadata.display)
  const plan = await stripe.plans.create(planInfo, stripeKey)
  user.plan = plan
  return plan
}

let couponNumber = 0
async function createCoupon (existingUser, properties) {
  couponNumber++
  const user = existingUser || await module.exports.createUser()
  const couponInfo = {
    percent_off: 25,
    duration: 'repeating',
    duration_in_months: 3,
    id: `coupon${couponNumber}` + new Date().getTime() + Math.ceil(Math.random() * 1000),
    metadata: {}
  }
  if (properties) {
    for (const property in properties) {
      couponInfo.metadata[property] = properties[property]
    }
  }
  const coupon = await stripe.coupons.create(couponInfo, stripeKey)
  user.coupon = coupon
  return coupon
}

async function createRefund (existingUser, subscriptionid) {
  const invoices = await stripe.invoices.list({subscription: subscriptionid}, stripeKey)
  const charge = await stripe.charges.retrieve(invoices.data[0].charge, stripeKey)
  const refundInfo = {
    charge: charge.id,
    amount: charge.amount,
    reason: 'requested_by_customer'
  }
  const refund = await stripe.refunds.create(refundInfo, stripeKey)
  existingUser.refund = refund
  return existingUser
}

async function createSubscriptionDiscount (existingUser, couponid) {
  const subscription = await stripe.subscriptions.update(existingUser.subscription.id, {
    coupon: couponid
  }, stripeKey)
  existingUser.discount = subscription.discount
  return existingUser
}

async function createCustomerDiscount (existingUser, couponid) {
  const subscription = await stripe.customers.update(existingUser.customer.id, {
    coupon: couponid
  }, stripeKey)
  existingUser.discount = subscription.discount
  return existingUser
}

async function createCustomer (existingUser, withCard) {
  const user = existingUser || await module.exports.createUser()
  const customerInfo = {
    metadata: {
      accountid: user.account.accountid,
      sessionid: user.session.sessionid
    }
  }
  user.customer = user.customer || await stripe.customers.create(customerInfo, stripeKey)
  if (withCard) {
    await createCard(user)
  }
  await dashboard.Account.setProperty(user.account.accountid, 'customerid', user.customer.id)
  return user
}

async function createCard (user) {
  const cardInfo = {
    source: {
      object: 'card',
      cvc: '111',
      number: '4111-1111-1111-1111',
      exp_month: 1,
      exp_year: new Date().getFullYear() + 1,
      name: 'Tester',
      address_line1: 'Test address line 1',
      address_line2: 'Test address line 2',
      address_city: 'Test address city',
      address_state: 'California',
      address_zip: '90120',
      address_country: 'US'
    }
  }
  const card = await stripe.customers.createCard(user.customer.id, cardInfo, stripeKey)
  user.card = card
  await stripe.customers.update(user.customer.id, {default_source: card.id}, stripeKey)
  user.customer = await stripe.customers.retrieve(user.customer.id, stripeKey)
  return user
}

async function createSubscription (existingUser, planid) {
  const user = existingUser || await module.exports.createUser()
  const subscriptionInfo = {
    items: [{
      plan: planid
    }]
  }
  if (!user.customer) {
    const plan = await stripe.plans.retrieve(planid, stripeKey)
    await createCustomer(user, plan.amount > 0)
  }
  subscriptionInfo.customer = user.customer.id
  const subscription = await stripe.subscriptions.create(subscriptionInfo, stripeKey)
  user.subscription = subscription
  if (user.card) {
    const invoices = await stripe.invoices.list({customer: user.customer.id}, stripeKey)
    user.invoice = invoices.data[0]
    user.charge = await stripe.charges.retrieve(user.invoice.charge, stripeKey)
  }
  return user
}

async function changeSubscription (existingUser, planid) {
  const subscriptionInfo = {
    items: [{
      plan: planid
    }]
  }
  const subscription = await stripe.subscriptions.update(existingUser.subscription.id, subscriptionInfo, stripeKey)
  existingUser.subscription = subscription
  const invoice = await stripe.invoices.create({ customer: existingUser.customer.id }, stripeKey)
  existingUser.invoice = invoice
  return existingUser
}

module.exports.createPayout = async () => {
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
