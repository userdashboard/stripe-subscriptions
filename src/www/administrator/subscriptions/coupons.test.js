/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../test-helper.js')

describe('/administrator/subscriptions/coupons', () => {
  describe('Coupons#BEFORE', () => {
    it('should bind coupons to req', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createCoupon(administrator, {published: true}, {}, 1000, 0)
      const req = TestHelper.createRequest(`/administrator/subscriptions/coupons`, 'GET')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
      await req.route.api.before(req)
      assert.notEqual(req.data, null)
      assert.notEqual(req.data.coupons, null)
      assert.equal(req.data.coupons[0].id, administrator.coupon.id)
    })
  })

  describe('Coupons#GET', () => {
    it('should present the coupons table', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createCoupon(administrator, {published: true}, {}, 1000, 0)
      const req = TestHelper.createRequest(`/administrator/subscriptions/coupons`, 'GET')
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
