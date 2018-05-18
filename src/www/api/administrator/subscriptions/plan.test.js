/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/administrator/subscriptions/plan', () => {
  describe('Plan#GET', () => {
    it('should return plan data', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true})
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/plan?planid=${administrator.plan.id}`, 'GET')
      req.account = administrator.account
      req.session = administrator.session
      const plan = await req.route.api.get(req)
      assert.equal(plan.id, administrator.plan.id)
    })
  })
})
