/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/administrator/subscriptions/unpublished-coupons-count', async () => {
  describe('UnpublishedCouponsCount#GET', () => {
    it('should count all unpublished coupons', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createCoupon(administrator, {published: true, amount_off: 25, currency: 'usd'})
      await TestHelper.createCoupon(administrator, {published: true, unpublished: true, amount_off: 1, currency: 'usd' })
      await TestHelper.createCoupon(administrator, {published: true, unpublished: true, amount_off: 2, currency: 'usd' })
      await TestHelper.createCoupon(administrator, {published: true, unpublished: true, amount_off: 3, currency: 'usd' })
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/unpublished-coupons-count`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      const result = await req.route.api.get(req)
      assert.equal(result, 3)
    })
  })
})
