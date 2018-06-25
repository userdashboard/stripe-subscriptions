/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe(`/api/administrator/subscriptions/delete-plan`, () => {
  describe('DeletePlan#DELETE', () => {
    it('should reject invalid planid', async () => {
      const administrator = await TestHelper.createAdministrator()
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/delete-plan?planid=invalid`, 'DELETE')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
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
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true})
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/delete-plan?planid=${administrator.plan.id}`, 'DELETE')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      await req.route.api.delete(req)
      req.session = await TestHelper.unlockSession(administrator)
      await req.route.api.delete(req)
      assert.equal(req.success, true)
    })
  })
})
