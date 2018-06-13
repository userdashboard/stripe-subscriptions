/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe.only('/api/administrator/subscriptions/plan-refunds-count', async () => {
  describe('PlanRefundsCount#GET', () => {
    it('should count all refunds on plan', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true})
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, administrator.plan.id)
      await TestHelper.createSubscription(user, administrator.plan.id)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/plan-refunds-count?planid=${administrator.plan.id}`, 'GET')
      req.account = administrator.account
      req.session = administrator.session
      const result = await req.route.api.get(req)
      assert.equal(result, 2)
    })
  })
})
