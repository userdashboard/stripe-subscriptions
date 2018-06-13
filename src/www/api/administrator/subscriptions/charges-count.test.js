/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/administrator/subscriptions/charges-count', async () => {
  describe('ChargesCount#GET', () => {
    it('should count charges', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true})
      const user1 = await TestHelper.createUser()
      await TestHelper.createSubscription(user1, administrator.plan.id)
      const user2 = await TestHelper.createUser()
      await TestHelper.createSubscription(user2, administrator.plan.id)
      const user3 = await TestHelper.createUser()
      await TestHelper.createSubscription(user3, administrator.plan.id)
      const req = TestHelper.createRequest('/api/administrator/subscriptions/charges-count', 'GET')
      req.account = administrator.account
      req.session = administrator.session
      const result = await req.route.api.get(req)
      assert.equal(result, 3)
    })
  })
})
