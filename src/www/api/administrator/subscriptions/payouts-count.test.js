/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/administrator/subscriptions/payouts-count', async () => {
  describe('PayoutsCount#GET', () => {
    it('should count payouts', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true})
      const plan1 = administrator.plan
      await TestHelper.createPlan(administrator, {published: true})
      const plan2 = administrator.plan
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, plan1.id)
      await TestHelper.createSubscription(user, plan2.id)
      const req = TestHelper.createRequest('/api/administrator/subscriptions/payouts-count', 'GET')
      req.account = administrator.account
      req.session = administrator.session
      const result = await req.route.api.get(req)
      assert.equal(result, 2)
    })
  })
})
