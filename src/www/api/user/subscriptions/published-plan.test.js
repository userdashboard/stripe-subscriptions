/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/user/subscriptions/plan', () => {
  describe('Plan#GET', () => {
    it('should not require account', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true})
      const req = TestHelper.createRequest(`/api/user/subscriptions/plan?planid=${administrator.plan.id}`, 'GET')
      const plan = await req.route.api.get(req)
      assert.equal(plan.id, administrator.plan.id)
    })

    it('should reject never published plan', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator)
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/subscriptions/plan?planid=${administrator.plan.id}`, 'GET')
      req.account = user.account
      req.session = user.session
      let errorMessage
      try {
        await req.route.api.get(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-plan')
    })

    it('should reject unpublished plan', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true, unpublished: true})
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/subscriptions/plan?planid=${administrator.plan.id}`, 'GET')
      req.account = user.account
      req.session = user.session
      let errorMessage
      try {
        await req.route.api.get(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-plan')
    })

    it('should return plan data', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true})
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/subscriptions/plan?planid=${administrator.plan.id}`, 'GET')
      req.account = user.account
      req.session = user.session
      const plan = await req.route.api.get(req)
      assert.equal(plan.id, administrator.plan.id)
    })
  })
})
