/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/administrator/subscriptions/charges-count', async () => {
  describe('ChargesCount#GET', () => {
    it('should count charges', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true})
      const user1 = await TestHelper.createUser()
      await TestHelper.createCustomer(user1)
      await TestHelper.createCard(user1)
      await TestHelper.createSubscription(user1, administrator.plan.id)
      await TestHelper.waitForWebhooks(2)
      const user2 = await TestHelper.createUser()
      await TestHelper.createCustomer(user2)
      await TestHelper.createCard(user2)
      await TestHelper.createSubscription(user2, administrator.plan.id)
      await TestHelper.waitForWebhooks(4)
      const user3 = await TestHelper.createUser()
      await TestHelper.createCustomer(user3)
      await TestHelper.createCard(user3)
      await TestHelper.createSubscription(user3, administrator.plan.id)
      await TestHelper.waitForWebhooks(6)
      const req = TestHelper.createRequest('/api/administrator/subscriptions/charges-count', 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      const result = await req.route.api.get(req)
      assert.equal(result, 3)
    })
  })
})
