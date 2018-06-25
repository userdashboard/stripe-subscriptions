/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe(`/api/administrator/subscriptions/delete-subscription`, () => {
  describe('DeleteSubscription#DELETE', () => {
    it('should reject invalid subscriptionid', async () => {
      const administrator = await TestHelper.createAdministrator()
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/delete-subscription?subscriptionid=invalid`, 'DELETE')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
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

    it('should require active subscription', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, administrator.plan.id)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/delete-subscription?subscriptionid=${user.subscription.id}`, 'DELETE')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      req.body = {
        refund: 'at_period_end'
      }
      await req.route.api.delete(req)
      req.session = await TestHelper.unlockSession(administrator)
      await req.route.api.delete(req)
      const req2 = TestHelper.createRequest(`/api/administrator/subscriptions/delete-subscription?subscriptionid=${user.subscription.id}`, 'DELETE')
      req2.account = administrator.account
      req2.session = administrator.session
      req2.body = {
        refund: 'at_period_end'
      }
      let errorMessage
      try {
        await req2.route.api.delete(req2)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-subscription')
    })

    it('should delete subscription at period end', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, administrator.plan.id)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/delete-subscription?subscriptionid=${user.subscription.id}`, 'DELETE')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      req.body = {
        refund: 'at_period_end'
      }
      await req.route.api.delete(req)
      req.session = await TestHelper.unlockSession(administrator)
      await req.route.api.delete(req)
      assert.equal(req.success, true)
    })

    it('should delete subscription immediately', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, administrator.plan.id)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/delete-subscription?subscriptionid=${user.subscription.id}`, 'DELETE')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      req.body = {
        refund: ''
      }
      await req.route.api.delete(req)
      req.session = await TestHelper.unlockSession(administrator)
      await req.route.api.delete(req)
      assert.equal(req.success, true)
    })
  })
})
