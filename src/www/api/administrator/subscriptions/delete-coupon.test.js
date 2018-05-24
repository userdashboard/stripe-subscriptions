/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe(`/api/administrator/subscriptions/delete-coupon`, () => {
  describe('DeleteCoupon#DELETE', () => {
    it('should reject invalid couponid', async () => {
      const administrator = await TestHelper.createAdministrator()
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/delete-coupon?couponid=invalid`, 'DELETE')
      req.account = administrator.account
      req.session = administrator.session
      let errorMessage
      try {
        await req.route.api.delete(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-couponid')
    })

    it('should delete coupon', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createCoupon(administrator, {published: true})
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/delete-coupon?couponid=${administrator.coupon.id}`, 'DELETE')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
      await req.route.api.delete(req)
      await TestHelper.completeAuthorization(req)
      await req.route.api.delete(req)
      assert.equal(req.success, true)
    })
  })
})
