/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe(`/api/administrator/subscriptions/set-coupon-published`, () => {
  describe('SetCouponPublished#PATCH', () => {
    it('should reject invalid couponid', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createCoupon(administrator)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/set-coupon-published?couponid=invalid`, 'PATCH')
      req.account = administrator.account
      req.session = administrator.session
      let errorMessage
      try {
        await req.route.api.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-couponid')
    })

    it('should reject published coupon', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createCoupon(administrator, { published: true })
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/set-coupon-published?couponid=${administrator.coupon.id}`, 'PATCH')
      req.account = administrator.account
      req.session = administrator.session
      let errorMessage
      try {
        await req.route.api.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-coupon')
    })

    it('should publish coupon', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createCoupon(administrator)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/set-coupon-published?couponid=${administrator.coupon.id}`, 'PATCH')
      req.account = administrator.account
      req.session = administrator.session
      await req.route.api.patch(req)
      await TestHelper.completeAuthorization(req)
      await req.route.api.patch(req)
      assert.equal(req.success, true)
    })
  })
})
