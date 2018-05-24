/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe(`/api/user/subscriptions/update-subscription-plan`, () => {
  describe('UpdateSubscriptionPlan#PATCH', () => {
    it('should reject invalid subscriptionid', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/subscriptions/update-subscription-plan?subscriptionid=invalid`, 'PATCH')
      req.account = user.account
      req.session = user.session
      req.body = {
        planid: 'also_invalid'
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
      await TestHelper.createPlan(administrator, {published: true})
      const plan1 = administrator.plan
      await TestHelper.createPlan(administrator, {published: true})
      const plan2 = administrator.plan
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, plan1.id)
      const user2 = await TestHelper.createUser()
      await TestHelper.createSubscription(user2, plan2.id)
      const req = TestHelper.createRequest(`/api/user/subscriptions/update-subscription-plan?subscriptionid=${user.subscription.id}`, 'PATCH')
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
      await TestHelper.createPlan(administrator, {published: true})
      const plan1 = administrator.plan
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, plan1.id)
      const req = TestHelper.createRequest(`/api/user/subscriptions/update-subscription-plan?subscriptionid=${user.subscription.id}`, 'PATCH')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      req.body = {
        planid: plan1.id
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
      await TestHelper.createPlan(administrator, {published: true}, {}, 0, 0)
      const plan1 = administrator.plan
      await TestHelper.createPlan(administrator, {published: true}, {}, 1000, 0)
      const plan2 = administrator.plan
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, plan1.id)
      const req = TestHelper.createRequest(`/api/user/subscriptions/update-subscription-plan?subscriptionid=${user.subscription.id}`, 'PATCH')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      req.body = {
        planid: plan2.id
      }
      await req.route.api.patch(req)
      await TestHelper.completeAuthorization(req)
      let errorMessage
      try {
        await req.route.api.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-payment-source')
    })

    it('should change plan', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true}, {}, 20000)
      const plan1 = administrator.plan
      await TestHelper.createPlan(administrator, {published: true}, {}, 1000)
      const plan2 = administrator.plan
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, plan1.id)
      const req = TestHelper.createRequest(`/api/user/subscriptions/update-subscription-plan?subscriptionid=${user.subscription.id}`, 'PATCH')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      req.body = {
        planid: plan2.id
      }
      await req.route.api.patch(req)
      await TestHelper.completeAuthorization(req)
      await req.route.api.patch(req)
      assert.equal(req.success, true)
    })
  })
})
