/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/administrator/subscriptions/coupons', () => {
  describe('Coupons#GET', () => {
    it.only('should limit coupons to one page', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createCoupon(administrator, {published: true, percent_off: 25, duration: 'repeating', duration_in_months: 1})
      const coupon2 = await TestHelper.createCoupon(administrator, {published: true, percent_off: 25, duration: 'repeating', duration_in_months: 2})
      const coupon3 = await TestHelper.createCoupon(administrator, {published: true, percent_off: 25, duration: 'repeating', duration_in_months: 3})
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/coupons`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      const coupons = await req.route.api.get(req)
      assert.equal(coupons.length, 2)
      assert.equal(coupons[0].id, coupon3.id)
      assert.equal(coupons[1].id, coupon2.id)
    })
  })
})
