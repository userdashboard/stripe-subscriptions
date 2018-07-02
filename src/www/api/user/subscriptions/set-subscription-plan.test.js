/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe(`/api/user/subscriptions/set-subscription-plan`, () => {
  describe('SetSubscriptionPlan#PATCH', () => {
    it('should reject invalid subscriptionid', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/subscriptions/set-subscription-plan?subscriptionid=invalid`, 'PATCH')
      req.account = user.account
      req.session = user.session
      req.body = {
        planid: 'invalid'
      }
      let errorMessage
      try {
        await req.route.api.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-subscriptionid')
    })

    it('should reject other account\'s subscription', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan1 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 1000})
      const plan2 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 2000})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, plan1.id)
      await TestHelper.waitForWebhooks(2)
      const user2 = await TestHelper.createUser()
      await TestHelper.createCustomer(user2)
      await TestHelper.createCard(user2)
      await TestHelper.createSubscription(user2, plan2.id)
      await TestHelper.waitForWebhooks(4)
      const req = TestHelper.createRequest(`/api/user/subscriptions/set-subscription-plan?subscriptionid=${user.subscription.id}`, 'PATCH')
      req.account = user2.account
      req.session = user2.session
      req.customer = user2.customer
      req.body = {
        planid: plan1.id
      }
      let errorMessage
      try {
        await req.route.api.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-account')
    })

    it('should reject same planid', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 1000})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, plan.id)
      await TestHelper.waitForWebhooks(2)
      const req = TestHelper.createRequest(`/api/user/subscriptions/set-subscription-plan?subscriptionid=${user.subscription.id}`, 'PATCH')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      req.body = {
        planid: plan.id
      }
      let errorMessage
      try {
        await req.route.api.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-plan')
    })

    it('should require user add card', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan1 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 0})
      const plan2 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 2000})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createSubscription(user, plan1.id)
      const req = TestHelper.createRequest(`/api/user/subscriptions/set-subscription-plan?subscriptionid=${user.subscription.id}`, 'PATCH')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      req.body = {
        planid: plan2.id
      }
      let errorMessage
      try {
        await req.route.api.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-cardid')
    })

    it('should change plan', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan1 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 20000})
      const plan2 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 1000})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, plan1.id)
      await TestHelper.waitForWebhooks(2)
      const req = TestHelper.createRequest(`/api/user/subscriptions/set-subscription-plan?subscriptionid=${user.subscription.id}`, 'PATCH')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      req.body = {
        planid: plan2.id
      }
      await req.route.api.patch(req)
      req.session = await TestHelper.unlockSession(user)
      await req.route.api.patch(req)
      assert.equal(req.success, true)
    })
  })
})
