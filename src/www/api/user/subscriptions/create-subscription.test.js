/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe(`/api/user/subscriptions/create-subscription`, () => {
  describe('CreateSubscription#POST', () => {
    it('should reject invalid planid', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/subscriptions/create-subscription?planid=invalid`, 'POST')
      req.account = user.account
      req.session = user.session
      let errorMessage
      try {
        await req.route.api.post(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-planid')
    })

    it('should reject never-published planid', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user, true)
      const req = TestHelper.createRequest(`/api/user/subscriptions/create-subscription?planid=${administrator.plan.id}`, 'POST')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      let errorMessage
      try {
        await req.route.api.post(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-plan')
    })

    it('should reject unpublished planid', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true, unpublished: true})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user, true)
      const req = TestHelper.createRequest(`/api/user/subscriptions/create-subscription?planid=${administrator.plan.id}`, 'POST')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      let errorMessage
      try {
        await req.route.api.post(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-plan')
    })

    it('should reject customer without card', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      const req = TestHelper.createRequest(`/api/user/subscriptions/create-subscription?planid=${administrator.plan.id}`, 'POST')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      let errorMessage
      try {
        await req.route.api.post(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-source')
    })

    it('should create authorized subscription', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user, true)
      const req = TestHelper.createRequest(`/api/user/subscriptions/create-subscription?planid=${administrator.plan.id}`, 'POST')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      await req.route.api.post(req)
      await TestHelper.completeAuthorization(req)
      await req.route.api.post(req)
      assert.equal(req.success, true)
    })
  })
})
