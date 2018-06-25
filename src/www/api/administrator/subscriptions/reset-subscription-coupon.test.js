/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper')

describe(`/api/administrator/subscriptions/delete-subscription-discount`, () => {
  describe('DeleteCustomerDiscount#DELETE', () => {
    it('should reject invalid subscriptionid', async () => {
      const administrator = await TestHelper.createAdministrator()
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/delete-subscription-discount?subscriptionid=invalid`, 'DELETE')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      let errorMessage
      try {
        await req.route.api.delete(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-subscriptionid')
    })

    it('should reject undiscounted subscription', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, administrator.plan.id)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/delete-subscription-discount?subscriptionid=${user.subscription.id}`, 'DELETE')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      let errorMessage
      try {
        await req.route.api.delete(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-subscription')
    })

    it('should delete subscription discount', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createCoupon(administrator, {published: true, percent_off: 25, duration: 'repeating', duration_in_months: 3})
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, administrator.plan.id)
      await TestHelper.createSubscriptionDiscount(user, administrator.coupon.id)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/delete-subscription-discount?subscriptionid=${user.subscription.id}`, 'DELETE')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      req.subscription = administrator.subscription
      await req.route.api.delete(req)
      req.session = await TestHelper.unlockSession(administrator)
      await req.route.api.delete(req)
      assert.equal(req.success, true)
    })
  })
})
