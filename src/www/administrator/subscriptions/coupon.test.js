/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/administrator/subscriptions/coupon', () => {
  describe('Coupon#BEFORE', () => {
    it('should reject invalid coupon', async () => {
      const administrator = await TestHelper.createAdministrator()
      const req = TestHelper.createRequest('/administrator/subscriptions/coupon?couponid=invalid', 'POST')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      let errorMessage
      try {
        await req.route.api.before(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-couponid')
    })

    it('should bind coupon to req', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createCoupon(administrator, {published: true, percent_off: 25, duration: 'repeating', duration_in_months: 3})
      const req = TestHelper.createRequest(`/administrator/subscriptions/coupon?couponid=${administrator.coupon.id}`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      await req.route.api.before(req)
      assert.notEqual(req.data, null)
      assert.notEqual(req.data.coupon, null)
      assert.equal(req.data.coupon.id, administrator.coupon.id)
    })
  })

  describe('Coupon#GET', () => {
    it('should present the coupon table', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createCoupon(administrator, {published: true, percent_off: 25, duration: 'repeating', duration_in_months: 3})
      const req = TestHelper.createRequest(`/administrator/subscriptions/coupon?couponid=${administrator.coupon.id}`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        const tr = doc.getElementById(administrator.coupon.id)
        assert.notEqual(null, tr)
      }
      return req.route.api.get(req, res)
    })
  })
})
