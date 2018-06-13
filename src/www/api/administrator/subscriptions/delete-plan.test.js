/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe(`/api/administrator/subscriptions/delete-plan`, () => {
  describe('DeletePlan#DELETE', () => {
    it('should reject invalid planid', async () => {
      const administrator = await TestHelper.createAdministrator()
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/delete-plan?planid=invalid`, 'DELETE')
      req.account = administrator.account
      req.session = administrator.session
      let errorMessage
      try {
        await req.route.api.delete(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-planid')
    })

    it('should delete plan', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true})
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/delete-plan?planid=${administrator.plan.id}`, 'DELETE')
      req.account = administrator.account
      req.session = administrator.session
      await req.route.api.delete(req)
      await TestHelper.completeAuthorization(req)
      await req.route.api.delete(req)
      assert.equal(req.success, true)
    })
  })
})
