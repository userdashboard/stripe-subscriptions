/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/administrator/subscriptions/charges-count', async () => {
  describe('ChargesCount#GET', () => {
    it('should count charges', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan1 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 1000})
      const plan2 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 2000})
      const plan3 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 3000})
      const user1 = await TestHelper.createUser()
      await TestHelper.createCustomer(user1)
      await TestHelper.createCard(user1)
      await TestHelper.createSubscription(user1, plan1.id)
      await TestHelper.waitForNextItem(`subscription:charges:${user1.subscription.id}`, null)
      const user2 = await TestHelper.createUser()
      await TestHelper.createCustomer(user2)
      await TestHelper.createCard(user2)
      await TestHelper.createSubscription(user2, plan2.id)
      await TestHelper.waitForNextItem(`subscription:charges:${user2.subscription.id}`, null)
      const user3 = await TestHelper.createUser()
      await TestHelper.createCustomer(user3)
      await TestHelper.createCard(user3)
      await TestHelper.createSubscription(user3, plan3.id)
      await TestHelper.waitForNextItem(`subscription:charges:${user3.subscription.id}`, null)
      const req = TestHelper.createRequest('/api/administrator/subscriptions/charges-count', 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      const result = await req.route.api.get(req)
      assert.equal(result, 3)
    })
  })
})
