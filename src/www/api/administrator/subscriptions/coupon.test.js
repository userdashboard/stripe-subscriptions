/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/administrator/subscriptions/coupon', () => {
  describe('Coupon#GET', () => {
    it('should reject invalid coupon', async () => {
      const administrator = await TestHelper.createAdministrator()
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/coupon?couponid=invalid`, 'GET')
      req.account = administrator.account
      req.session = administrator.session
      let errorMessage
      try {
        await req.route.api.get(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-couponid')
    })

    it('should return coupon data', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createCoupon(administrator, {published: true})
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/coupon?couponid=${administrator.coupon.id}`, 'GET')
      req.account = administrator.account
      req.session = administrator.session
      const coupon = await req.route.api.get(req)
      assert.equal(coupon.id, administrator.coupon.id)
    })
  })
})
