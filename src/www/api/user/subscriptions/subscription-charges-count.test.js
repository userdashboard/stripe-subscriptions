/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/user/subscriptions/subscription-charges-count', async () => {
  describe('SubscriptionChargesCount#GET', () => {
    it.only('should count all charges on subscription', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan1 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 10000, trial_period_days: 0})
      const plan2 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 20000, trial_period_days: 0})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, plan1.id)
      await TestHelper.changeSubscription(user, plan2.id)
      await TestHelper.waitForWebhooks()
      const req = TestHelper.createRequest(`/api/user/subscriptions/subscription-charges-count?subscriptionid=${user.subscription.id}`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      await req.route.api.get(req)
      const req2 = TestHelper.createRequest(`/api/user/subscriptions/subscription-charges?subscriptionid=${user.subscription.id}`, 'GET')
      req2.account = user.account
      req2.session = user.session
      req2.customer = user.customer
      const charges = await req2.route.api.get(req2)
      assert.notEqual(null, charges)
      assert.equal(charges.length, 2)
    })
  })
})
