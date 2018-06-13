/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe.only('/api/user/subscriptions/published-products-count', async () => {
  describe('PublishedProducts#GET', () => {
    it('should count published products', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true}, {}, 1000, 0)
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createSubscription(user, user.subscription.id)
      await TestHelper.createCard(user)
      const req = TestHelper.createRequest(`/api/user/subscriptions/published-products-count`, 'GET')
      req.account = user.account
      req.session = user.session
      const result = await req.route.api.get(req)
      assert.equal(result, 2)
    })
  })
})
