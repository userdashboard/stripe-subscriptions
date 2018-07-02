/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/user/subscriptions/subscription-charges-count', async () => {
  describe('SubscriptionChargesCount#GET', () => {
    it('should count all charges on subscription', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan1 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 1000})
      const plan2 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 2000})
      const plan3 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 3000})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, plan1.id)
      await TestHelper.waitForWebhooks(2)
      await TestHelper.changeSubscription(user, plan2.id)
      await TestHelper.waitForWebhooks(4)
      await TestHelper.changeSubscription(user, plan3.id)
      await TestHelper.waitForWebhooks(6)
      const req = TestHelper.createRequest(`/api/user/subscriptions/subscription-charges-count?subscriptionid=${user.subscription.id}`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const count = await req.route.api.get(req)
      assert.equal(count, 3)
    })
  })
})
