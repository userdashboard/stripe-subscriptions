/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe(`/api/administrator/subscriptions/set-coupon-unpublished`, () => {
  describe('SetCouponUnpublished#PATCH', () => {
    it('should reject invalid couponid', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createCoupon(administrator)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/set-coupon-unpublished?couponid=invalid`, 'PATCH')
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

    it('should reject never published coupon', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createCoupon(administrator, { })
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/set-coupon-unpublished?couponid=${administrator.coupon.id}`, 'PATCH')
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

    it('should reject unpublished coupon', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createCoupon(administrator, { published: true, unpublished: true })
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/set-coupon-unpublished?couponid=${administrator.coupon.id}`, 'PATCH')
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

    it('should unpublish coupon', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createCoupon(administrator, { published: true })
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/set-coupon-unpublished?couponid=${administrator.coupon.id}`, 'PATCH')
      req.account = administrator.account
      req.session = administrator.session
      await req.route.api.patch(req)
      await TestHelper.completeAuthorization(req)
      await req.route.api.patch(req)
      assert.equal(req.success, true)
    })
  })
})
