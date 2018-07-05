/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/administrator/subscriptions/product-subscriptions', () => {
  describe('ProductSubscriptions#GET', () => {
    it('should limit subscriptions on product to one page', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan1 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 1000})
      const plan2 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 1000})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, plan1.id)
      await TestHelper.waitForWebhooks(2)
      const user2 = await TestHelper.createUser()
      await TestHelper.createCustomer(user2)
      await TestHelper.createCard(user2)
      const subscription2 = await TestHelper.createSubscription(user2, plan2.id)
      await TestHelper.waitForWebhooks(4)
      const user3 = await TestHelper.createUser()
      await TestHelper.createCustomer(user3)
      await TestHelper.createCard(user3)
      const subscription3 = await TestHelper.createSubscription(user3, plan2.id)
      await TestHelper.waitForWebhooks(6)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/product-subscriptions?productid=${product.id}`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      const subscriptions = await req.route.api.get(req)
      assert.equal(subscriptions.length, 2)
      assert.equal(subscriptions[0].id, subscription3.id)
      assert.equal(subscriptions[1].id, subscription2.id)
    })
  })
})
