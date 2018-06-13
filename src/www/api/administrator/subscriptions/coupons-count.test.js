/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/administrator/subscriptions/coupons-count', async () => {
  describe('CouponsCount#GET', () => {
    it('should count coupons', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true})
      await TestHelper.createCoupon(administrator, {published: true})
      await TestHelper.createCoupon(administrator, {published: true})
      const req = TestHelper.createRequest('/api/administrator/subscriptions/coupons-count', 'GET')
      req.account = administrator.account
      req.session = administrator.session
      const result = await req.route.api.get(req)
      assert.equal(result, 2)
    })
  })
})
