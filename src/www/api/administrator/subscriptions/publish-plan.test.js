/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe(`/api/administrator/subscriptions/publish-plan`, () => {
  describe('PublishPlan#PATCH', () => {
    it('should reject invalid planid', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/publish-plan?planid=invalid`, 'PATCH')
      req.account = administrator.account
      req.session = administrator.session
      try {
        await req.route.api.patch(req)
      } catch (error) {
        assert.equal(error.message, 'invalid-planid')
      }
    })

    it('should reject published plan', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, { published: true })
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/publish-plan?planid=${administrator.plan.id}`, 'PATCH')
      req.account = administrator.account
      req.session = administrator.session
      try {
        await req.route.api.patch(req)
      } catch (error) {
        assert.equal(error.message, 'invalid-plan')
      }
    })

    it('should publish plan', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/publish-plan?planid=${administrator.plan.id}`, 'PATCH')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
      await req.route.api.patch(req)
      await TestHelper.completeAuthorization(req)
      await req.route.api.patch(req)
      assert.equal(req.success, true)
    })
  })
})
