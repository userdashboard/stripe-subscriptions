/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/administrator/subscriptions/customer-subscriptions', () => {
  describe('CustomerSubscriptions#GET', () => {
    it('should limit subscriptions on customer to one page', async () => {
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
      const subscription2 = await TestHelper.createSubscription(user, plan2.id)
      await TestHelper.waitForWebhooks(4)
      const subscription3 = await TestHelper.createSubscription(user, plan3.id)
      await TestHelper.waitForWebhooks(6)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/customer-subscriptions?customerid=${user.customer.id}`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      const subscriptions = await req.route.api.get(req)
      assert.equal(subscriptions.length, 2)
      assert.equal(subscriptions[0].id, subscription3.id)
      assert.equal(subscriptions[1].id, subscription2.id)
    })
  })
})
