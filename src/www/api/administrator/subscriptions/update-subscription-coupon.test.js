/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe(`/api/administrator/subscriptions/update-subscription-coupon`, () => {
  describe('UpdateSubscriptionCoupon#PATCH', () => {
    it('should reject invalid subscriptionid', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createCoupon(administrator, { published: true })
      const newCoupon = administrator.coupon
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/update-subscription-coupon?subscriptionid=invalid`, 'PATCH')
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        couponid: newCoupon.id
      }
      try {
        await req.route.api.patch(req)
      } catch (error) {
        assert.equal(error.message, 'invalid-subscriptionid')
      }
    })

    it('should reject invalid couponid', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, { published: true })
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, administrator.plan.id)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/update-subscription-coupon?subscriptionid=${user.subscription.id}`, 'PATCH')
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        couponid: 'invalid'
      }
      try {
        await req.route.api.patch(req)
      } catch (error) {
        assert.equal(error.message, 'invalid-couponid')
      }
    })

    it('should reject unpublished coupon', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, { published: true })
      await TestHelper.createCoupon(administrator, { published: true, unpublished: true })
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, administrator.plan.id)
      const newCoupon = administrator.coupon
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/update-subscription-coupon?subscriptionid=${user.subscription.id}`, 'PATCH')
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        couponid: newCoupon.id
      }
      try {
        await req.route.api.patch(req)
      } catch (error) {
        assert.equal(error.message, 'invalid-coupon')
      }
    })

    it('should update subscription coupon', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, { published: true })
      await TestHelper.createCoupon(administrator, { published: true })
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, administrator.plan.id)
      const newCoupon = administrator.coupon
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/update-subscription-coupon?subscriptionid=${user.subscription.id}`, 'PATCH')
      req.account = administrator.account
      req.session = administrator.session
      req.subscription = administrator.subscription
      req.body = {
        couponid: newCoupon.id
      }
      await req.route.api.patch(req)
      await TestHelper.completeAuthorization(req)
      await req.route.api.patch(req)
      assert.equal(req.success, true)
    })
  })
})
