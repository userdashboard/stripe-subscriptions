/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/administrator/subscriptions/product-customers', () => {
  describe('ProductCustomers#GET', () => {
    it('should limit customers on product to one page', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 1000})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, plan.id)
      await TestHelper.waitForWebhooks(2)
      const user2 = await TestHelper.createUser()
      await TestHelper.createCustomer(user2)
      await TestHelper.createCard(user2)
      await TestHelper.createSubscription(user2, plan.id)
      await TestHelper.waitForWebhooks(4)
      const user3 = await TestHelper.createUser()
      await TestHelper.createCustomer(user3)
      await TestHelper.createCard(user3)
      await TestHelper.createSubscription(user3, plan.id)
      await TestHelper.waitForWebhooks(4)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/product-customers?productid=${user.product.id}`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      const customers = await req.route.api.get(req)
      assert.equal(subscriptions.length, global.PAGE_SIZE)
      assert.equal(subscriptions[0].amount, plan2.amount)
      assert.equal(subscriptions[0].subscription, subscription2.id)
      assert.equal(subscriptions[1].amount, plan1.amount)
      assert.equal(subscriptions[1].subscription, subscription1.id)
    })
  })
})
