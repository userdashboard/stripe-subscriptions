/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper')

describe(`/api/administrator/subscriptions/delete-subscription-discount`, () => {
  describe('DeleteCustomerDiscount#DELETE', () => {
    it('should reject invalid subscriptionid', async () => {
      const administrator = await TestHelper.createAdministrator()
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/delete-subscription-discount?subscriptionid=invalid`, 'DELETE')
      req.account = administrator.account
      req.session = administrator.session
      try {
        await req.route.api.delete(req)
      } catch (error) {
        assert.equal(error.message, 'invalid-subscriptionid')
      }
    })

    it('should reject undiscounted subscription', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, { published: true })
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, administrator.plan.id)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/delete-subscription-discount?subscriptionid=${user.subscription.id}`, 'DELETE')
      req.account = administrator.account
      req.session = administrator.session
      try {
        await req.route.api.delete(req)
      } catch (error) {
        assert.equal(error.message, 'invalid-subscription')
      }
    })

    it('should delete subscription discount', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createCoupon(administrator, { published: true })
      await TestHelper.createPlan(administrator, { published: true })
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, administrator.plan.id)
      await TestHelper.createSubscriptionDiscount(user, administrator.coupon.id)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/delete-subscription-discount?subscriptionid=${user.subscription.id}`, 'DELETE')
      req.account = administrator.account
      req.session = administrator.session
      req.subscription = administrator.subscription
      await req.route.api.delete(req)
      await TestHelper.completeAuthorization(req)
      await req.route.api.delete(req)
      assert.equal(req.success, true)
    })
  })
})
