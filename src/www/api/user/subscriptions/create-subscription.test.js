/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe(`/api/user/subscriptions/create-subscription`, () => {
  describe('CreateSubscription#POST', () => {
    it('should reject invalid planid', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      const req = TestHelper.createRequest(`/api/user/subscriptions/create-subscription?planid=invalid`, 'POST')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
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
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
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

    it('should reject unpublished plan', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan = await TestHelper.createPlan(administrator, {productid: product.id, published: true, unpublished: true})
      assert.notEqual(plan, null)
      assert.notEqual(null, plan.metadata.unpublished)
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      const req = TestHelper.createRequest(`/api/user/subscriptions/create-subscription?planid=${plan.id}`, 'POST')
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

    it('should allow customer without card on free plan', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 0})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      const req = TestHelper.createRequest(`/api/user/subscriptions/create-subscription?planid=${administrator.plan.id}`, 'POST')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      await req.route.api.post(req)
      req.session = await TestHelper.unlockSession(user)
      const subscription = await req.route.api.post(req)
      assert.notEqual(subscription, null)
      assert.equal(subscription.object, 'subscription')
      assert.equal(req.success, true)
    })

    it('should reject customer without card', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 1000})
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
      assert.equal(errorMessage, 'invalid-cardid')
    })

    it('should create authorized subscription', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      const req = TestHelper.createRequest(`/api/user/subscriptions/create-subscription?planid=${administrator.plan.id}`, 'POST')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      await req.route.api.post(req)
      req.session = await TestHelper.unlockSession(user)
      await req.route.api.post(req)
      assert.equal(req.success, true)
    })
  })
})
