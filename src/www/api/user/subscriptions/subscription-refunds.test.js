/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/user/subscriptions/subscription-refunds', () => {
  describe('SubscriptionRefunds#GET', () => {
    it('should limit refunds on subscription to one page', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan1 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 1000})
      const plan2 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 2000})
      const plan3 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 3000})
      const plan4 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 4000})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, plan4.id)
      await TestHelper.waitForWebhooks(2)
      await TestHelper.changeSubscription(user, plan3.id)
      await TestHelper.waitForWebhooks(4)
      await TestHelper.createRefund(administrator, user.charge)
      await TestHelper.waitForWebhooks(5)
      await TestHelper.changeSubscription(user, plan2.id)
      await TestHelper.waitForWebhooks(7)
      const refund2 = await TestHelper.createRefund(administrator, user.charge)
      await TestHelper.waitForWebhooks(8)
      await TestHelper.changeSubscription(user, plan1.id)
      await TestHelper.waitForWebhooks(10)
      const refund3 = await TestHelper.createRefund(administrator, user.charge)
      await TestHelper.waitForWebhooks(11)
      const req = TestHelper.createRequest(`/api/user/subscriptions/subscription-refunds?subscriptionid=${user.subscription.id}`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const refunds = await req.route.api.get(req)
      assert.equal(refunds.length, 2)
      assert.equal(refunds[0].id, refund3.id)
      assert.equal(refunds[1].id, refund2.id)
    })
  })
})
