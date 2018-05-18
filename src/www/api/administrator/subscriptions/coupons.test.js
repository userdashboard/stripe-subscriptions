/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/administrator/subscriptions/coupons', () => {
  describe('Coupons#GET', () => {
    it('should return coupon list', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createCoupon(administrator, {published: true})
      const coupon1 = administrator.coupon
      await TestHelper.createCoupon(administrator, {published: true})
      const coupon2 = administrator.coupon
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/coupons`, 'GET')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
      const coupons = await req.route.api.get(req)
      assert.equal(coupons.length >= 2, true)
      assert.equal(coupons[0].id, coupon2.id)
      assert.equal(coupons[1].id, coupon1.id)
    })
  })
})
