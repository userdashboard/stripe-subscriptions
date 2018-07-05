/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe(`/api/administrator/subscriptions/set-coupon-published`, () => {
  describe('SetCouponPublished#PATCH', () => {
    it('should reject invalid couponid', async () => {
      const administrator = await TestHelper.createAdministrator()
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/set-coupon-published?couponid=invalid`, 'PATCH')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
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
      await TestHelper.createCoupon(administrator, {published: true, percent_off: 25, duration: 'repeating', duration_in_months: 3})
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/set-coupon-published?couponid=${administrator.coupon.id}`, 'PATCH')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
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
      await TestHelper.createCoupon(administrator, {percent_off: 25, duration: 'repeating', duration_in_months: 3})
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/set-coupon-published?couponid=${administrator.coupon.id}`, 'PATCH')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      await req.route.api.patch(req)
      req.administratorSession = req.session = await TestHelper.unlockSession(administrator)
      await req.route.api.patch(req)
      assert.equal(req.success, true)
    })
  })
})
