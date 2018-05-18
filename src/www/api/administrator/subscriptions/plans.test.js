/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/administrator/subscriptions/plans', () => {
  describe('Plans#GET', () => {
    it('should return plan list', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true})
      const plan1 = administrator.plan
      await TestHelper.createPlan(administrator, {published: true, unpublished: true})
      const plan2 = administrator.plan
      await TestHelper.createPlan(administrator, {published: true})
      const plan3 = administrator.plan
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/plans`, 'GET')
      req.account = administrator.account
      req.session = administrator.session
      const plans = await req.route.api.get(req)
      assert.equal(true, plans.length >= 3)
      assert.equal(plans[0].id, plan3.id)
      assert.equal(plans[1].id, plan2.id)
      assert.equal(plans[2].id, plan1.id)
    })
  })
})
