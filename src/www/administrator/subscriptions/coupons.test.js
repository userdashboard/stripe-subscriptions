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
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        const tr = doc.getElementById(administrator.coupon.id)
        assert.notEqual(null, tr)
      }
      return req.route.api.get(req, res)
    })

    it('should limit coupons to one page', async () => {
      const user = await TestHelper.createUser()
      for (let i = 0, len = 20; i < len; i++) {
        await TestHelper.createResetCode(user)
      }
      const req = TestHelper.createRequest('/administrator/subscriptions/coupons', 'GET')
      req.account = user.account
      req.session = user.session
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        assert.notEqual(null, doc)
        const table = doc.getElementById('reset-codes-table')
        const rows = table.getElementsByTagName('tr')
        assert.equal(rows.length, global.PAGE_SIZE + 1)
      }
      return req.route.api.get(req, res)
    })

    it('should enforce page size', async () => {
      const user = await TestHelper.createUser()
      for (let i = 0, len = 20; i < len; i++) {
        await TestHelper.createResetCode(user)
      }
      const req = TestHelper.createRequest('/administrator/subscriptions/coupons', 'GET')
      req.account = user.account
      req.session = user.session
      global.PAGE_SIZE = 8
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        assert.notEqual(null, doc)
        const table = doc.getElementById('reset-codes-table')
        const rows = table.getElementsByTagName('tr')
        assert.equal(rows.length, 8 + 1)
      }
      return req.route.api.get(req, res)
    })

    it('should enforce specified offset', async () => {
      const user = await TestHelper.createUser()
      const codes = [ user.code ]
      for (let i = 0, len = 30; i < len; i++) {
        await TestHelper.createResetCode(user)
        codes.unshift(user.code)
      }
      const req = TestHelper.createRequest('/administrator/subscriptions/coupons?offset=10', 'GET')
      req.account = user.account
      req.session = user.session
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        assert.notEqual(null, doc)
        for (let i = 0, len = 10; i < len; i++) {
          assert.notEqual(null, doc.getElementById(codes[10 + i].codeid))
        }
      }
      return req.route.api.get(req, res)
    })
  })
})
