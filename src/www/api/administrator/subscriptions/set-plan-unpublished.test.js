/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe(`/api/administrator/subscriptions/set-plan-unpublished`, () => {
  describe('SetPlanUnpublished#PATCH', () => {
    it('should reject invalid planid', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/set-plan-unpublished?planid=invalid`, 'PATCH')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      let errorMessage
      try {
        await req.route.api.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-planid')
    })

    it('should reject never published plan', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id})
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/set-plan-unpublished?planid=${administrator.plan.id}`, 'PATCH')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      let errorMessage
      try {
        await req.route.api.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-plan')
    })

    it('should reject unpublished plan', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, unpublished: true})
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/set-plan-unpublished?planid=${administrator.plan.id}`, 'PATCH')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      let errorMessage
      try {
        await req.route.api.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-plan')
    })

    it('should unpublish plan', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true})
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/set-plan-unpublished?planid=${administrator.plan.id}`, 'PATCH')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      await req.route.api.patch(req)
      req.session = await TestHelper.unlockSession(administrator)
      await req.route.api.patch(req)
      assert.equal(req.success, true)
    })
  })
})
