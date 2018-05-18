/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe(`/api/user/subscriptions/delete-subscription`, () => {
  describe('DeleteSubscription#DELETE', () => {
    it('should reject invalid subscriptionid', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/subscriptions/delete-subscription?subscriptionid=invalid`, 'DELETE')
      req.account = user.account
      req.session = user.session
      req.body = {
        refund: 'at_period_end'
      }
      try {
        await req.route.api.delete(req)
      } catch (error) {
        assert.equal(error.message, 'invalid-subscriptionid')
      }
    })

    it('should reject other account\'s subscription', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true})
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, administrator.plan.id)
      const user2 = await TestHelper.createUser()
      await TestHelper.createSubscription(user2, administrator.plan.id)
      const req = TestHelper.createRequest(`/api/user/subscriptions/delete-subscription?subscriptionid=${user.subscription.id}`, 'DELETE')
      req.account = user2.account
      req.session = user2.session
      req.customer = user2.customer
      req.body = {
        refund: 'at_period_end'
      }
      try {
        await req.route.api.delete(req)
      } catch (error) {
        assert.equal(error.message, 'invalid-account')
      }
    })

    it('should require active subscription', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true})
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, administrator.plan.id)
      const req = TestHelper.createRequest(`/api/user/subscriptions/delete-subscription?subscriptionid=${user.subscription.id}`, 'DELETE')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      req.body = {
        refund: 'at_period_end'
      }
      await req.route.api.delete(req)
      await TestHelper.completeAuthorization(req)
      await req.route.api.delete(req)
      const req2 = TestHelper.createRequest(`/api/user/subscriptions/delete-subscription?subscriptionid=${user.subscription.id}`, 'DELETE')
      req2.account = req.account
      req2.session = req.session
      req2.customer = req.customer
      try {
        await req2.route.api.delete(req2)
      } catch (error) {
        assert.equal(error.message, 'invalid-subscription')
      }
    })

    it('should delete subscription at period end', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true})
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, administrator.plan.id)
      const req = TestHelper.createRequest(`/api/user/subscriptions/delete-subscription?subscriptionid=${user.subscription.id}`, 'DELETE')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      req.body = {
        refund: 'at_period_end'
      }
      await req.route.api.delete(req)
      await TestHelper.completeAuthorization(req)
      await req.route.api.delete(req)
      // now check the subscription is deleted and on-going
      const req2 = TestHelper.createRequest(`/api/user/subscriptions/subscription?subscriptionid=${user.subscription.id}`, 'GET')
      req2.account = req.account
      req2.session = req.session
      req2.customer = req.customer
      const subscription = await req2.route.api.get(req2)
      assert.equal(subscription.cancel_at_period_end, true)
    })

    it('should delete subscription immediately', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true})
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, administrator.plan.id)
      const req = TestHelper.createRequest(`/api/user/subscriptions/delete-subscription?subscriptionid=${user.subscription.id}`, 'DELETE')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      req.body = {
        refund: 'refund'
      }
      await req.route.api.delete(req)
      await TestHelper.completeAuthorization(req)
      await req.route.api.delete(req)
      assert.equal(req.success, true)
    })
  })
})
