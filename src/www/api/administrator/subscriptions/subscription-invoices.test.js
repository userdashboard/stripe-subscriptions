/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/administrator/subscriptions/subscription-invoices', () => {
  describe('SubscriptionInvoices#GET', () => {
    it('should limit invoices on subscription to one page', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product1 = await TestHelper.createProduct(administrator)
      await TestHelper.createPlan(administrator, {productid: product1.id, published: true})
      const product2 = await TestHelper.createProduct(administrator)
      await TestHelper.createPlan(administrator, {productid: product2.id, published: true})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      const subscription1 = await TestHelper.createSubscription(user, product1.id)
      await TestHelper.waitForWebhooks(2)
      const subscription2 = await TestHelper.createSubscription(user, product2.id)
      await TestHelper.waitForWebhooks(4)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/subscription-invoices?subscriptionid=${user.subscription.id}`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      const subscriptions = await req.route.api.get(req)
      assert.equal(subscriptions.length, global.PAGE_SIZE)
      assert.equal(subscriptions[0].amount, product2.amount)
      assert.equal(subscriptions[0].subscription, subscription2.id)
      assert.equal(subscriptions[1].amount, product1.amount)
      assert.equal(subscriptions[1].subscription, subscription1.id)
    })
  })
})
