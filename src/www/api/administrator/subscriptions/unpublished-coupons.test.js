/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/administrator/subscriptions/unpublished-coupons', () => {
  describe('UnpublishedCoupons#GET', () => {
    it('should limit unpublished coupons to one page', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createCoupon(administrator, {published: true, unpublished: true})
      const coupon2 = await TestHelper.createCoupon(administrator, {published: true, unpublished: true})
      const coupon3 = await TestHelper.createCoupon(administrator, {published: true, unpublished: true})
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/unpublished-coupons`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      const coupons = await req.route.api.get(req)
      assert.equal(coupons.length, 2)
      assert.equal(coupons[0].id, coupon3.id)
      assert.equal(coupons[1].id, coupon2.id)
    })
  })
})
