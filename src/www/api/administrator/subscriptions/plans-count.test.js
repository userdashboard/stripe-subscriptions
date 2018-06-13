/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/administrator/subscriptions/plans-count', async () => {
  describe('PlansCount#GET', () => {
    it('should count plans', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true})
      await TestHelper.createPlan(administrator, {published: true})
      await TestHelper.createPlan(administrator, {})
      const req = TestHelper.createRequest('/api/administrator/subscriptions/plans-count', 'GET')
      req.account = administrator.account
      req.session = administrator.session
      const result = await req.route.api.get(req)
      assert.equal(result, 3)
    })
  })
})
