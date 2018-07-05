/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/administrator/subscriptions/published-coupons-count', async () => {
  describe('PublishedCouponsCount#GET', () => {
    it('should count all published coupons', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createCoupon(administrator, {published: true})
      await TestHelper.createCoupon(administrator, {published: true})
      await TestHelper.createCoupon(administrator, {published: true, unpublished: true})
      await TestHelper.createCoupon(administrator)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/published-coupons-count`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      const result = await req.route.api.get(req)
      assert.equal(result, 2)
    })
  })
})
