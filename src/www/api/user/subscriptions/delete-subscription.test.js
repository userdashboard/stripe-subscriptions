/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

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
      let errorMessage
      try {
        await req.route.api.delete(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-subscriptionid')
    })

    it('should reject other account\'s subscription', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 10000})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, administrator.plan.id)
      await TestHelper.waitForNextItem(`subscription:invoices:${user.subscription.id}`, null)
      const user2 = await TestHelper.createUser()
      await TestHelper.createCustomer(user2)
      const req = TestHelper.createRequest(`/api/user/subscriptions/delete-subscription?subscriptionid=${user.subscription.id}`, 'DELETE')
      req.account = user2.account
      req.session = user2.session
      req.customer = user2.customer
      req.body = {
        refund: 'at_period_end'
      }
      let errorMessage
      try {
        await req.route.api.delete(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-account')
    })

    it('should require active subscription', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 10000, trial_period_days: 0})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, administrator.plan.id)
      await TestHelper.waitForNextItem(`subscription:invoices:${user.subscription.id}`, null)
      const req = TestHelper.createRequest(`/api/user/subscriptions/delete-subscription?subscriptionid=${user.subscription.id}`, 'DELETE')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      req.body = {
        refund: 'at_period_end'
      }
      await req.route.api.delete(req)
      req.session = await TestHelper.unlockSession(user)
      await req.route.api.delete(req)
      const req2 = TestHelper.createRequest(`/api/user/subscriptions/delete-subscription?subscriptionid=${user.subscription.id}`, 'DELETE')
      req2.account = req.account
      req2.session = req.session
      req2.customer = req.customer
      let errorMessage
      try {
        await req2.route.api.delete(req2)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-subscriptionid')
    })

    it('should delete subscription at period end', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 10000, trial_period_days: 0})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, administrator.plan.id)
      await TestHelper.waitForNextItem(`subscription:invoices:${user.subscription.id}`, null)
      const req = TestHelper.createRequest(`/api/user/subscriptions/delete-subscription?subscriptionid=${user.subscription.id}`, 'DELETE')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      req.body = {
        refund: 'at_period_end'
      }
      await req.route.api.delete(req)
      req.session = await TestHelper.unlockSession(user)
      const subscription = await req.route.api.delete(req)
      assert.equal(subscription.cancel_at_period_end, true)
    })

    it('should delete subscription immediately', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 10000, trial_period_days: 0})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, administrator.plan.id)
      await TestHelper.waitForNextItem(`subscription:invoices:${user.subscription.id}`, null)
      const req = TestHelper.createRequest(`/api/user/subscriptions/delete-subscription?subscriptionid=${user.subscription.id}`, 'DELETE')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      req.body = {
        refund: 'refund'
      }
      await req.route.api.delete(req)
      req.session = await TestHelper.unlockSession(user)
      await req.route.api.delete(req)
      assert.equal(req.success, true)
    })
  })
})
