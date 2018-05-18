/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe(`/api/administrator/subscriptions/publish-coupon`, () => {
  describe('PublishCoupon#PATCH', () => {
    it('should reject invalid couponid', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createCoupon(administrator)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/publish-coupon?couponid=invalid`, 'PATCH')
      req.account = administrator.account
      req.session = administrator.session
      try {
        await req.route.api.patch(req)
      } catch (error) {
        assert.equal(error.message, 'invalid-couponid')
      }
    })

    it('should reject published coupon', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createCoupon(administrator, { published: true })
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/publish-coupon?couponid=${administrator.coupon.id}`, 'PATCH')
      req.account = administrator.account
      req.session = administrator.session
      try {
        await req.route.api.patch(req)
      } catch (error) {
        assert.equal(error.message, 'invalid-coupon')
      }
    })

    it('should publish coupon', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createCoupon(administrator)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/publish-coupon?couponid=${administrator.coupon.id}`, 'PATCH')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
      await req.route.api.patch(req)
      await TestHelper.completeAuthorization(req)
      await req.route.api.patch(req)
      assert.equal(req.success, true)
    })
  })
})
