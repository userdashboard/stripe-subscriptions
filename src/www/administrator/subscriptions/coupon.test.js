/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../test-helper.js')

describe('/administrator/subscriptions/coupon', () => {
  describe('Coupon#BEFORE', () => {
    it('should reject invalid coupon', async () => {
      const administrator = await TestHelper.createAdministrator()
      const req = TestHelper.createRequest('/administrator/subscriptions/coupon?couponid=invalid', 'POST')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
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
      await TestHelper.createCoupon(administrator, {published: true}, {}, 1000, 0)
      const req = TestHelper.createRequest(`/administrator/subscriptions/coupon?couponid=${administrator.coupon.id}`, 'GET')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
      await req.route.api.before(req)
      assert.notEqual(req.data, null)
      assert.notEqual(req.data.coupon, null)
      assert.equal(req.data.coupon.id, administrator.coupon.id)
    })
  })

  describe('Coupon#GET', () => {
    it('should present the coupon table', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createCoupon(administrator, {published: true}, {}, 1000, 0)
      const req = TestHelper.createRequest(`/administrator/subscriptions/coupon?couponid=${administrator.coupon.id}`, 'GET')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
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
