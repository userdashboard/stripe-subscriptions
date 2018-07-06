/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/administrator/subscriptions/subscription-refunds', () => {
  describe('SubscriptionRefunds#GET', () => {
    it('should limit refunds on subscription to one page', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan1 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 1000})
      const plan2 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 10000})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, plan1.id)
      await TestHelper.waitForWebhooks(2)
      await TestHelper.loadCharge(user, user.subscription.id)
      const refund1 = await TestHelper.createRefund(administrator, user.charge)
      await TestHelper.waitForWebhooks(3)
      await TestHelper.changeSubscription(user, plan2.id)
      await TestHelper.waitForWebhooks(5)
      await TestHelper.loadCharge(user, user.subscription.id)
      const refund2 = await TestHelper.createRefund(administrator, user.charge)
      await TestHelper.waitForWebhooks(6)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/subscription-refunds?subscriptionid=${user.subscription.id}`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      const refunds = await req.route.api.get(req)
      assert.equal(refunds.length, 2)
      assert.equal(refunds[0].id, refund2.id)
      assert.equal(refunds[1].id, refund1.id)
    })
  })
})
