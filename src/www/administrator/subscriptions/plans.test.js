/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/administrator/subscriptions/plans', () => {
  describe('Plans#BEFORE', () => {
    it('should bind plans to req', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 1000, trial_period_days: 0})
      const req = TestHelper.createRequest(`/administrator/subscriptions/plans`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      await req.route.api.before(req)
      assert.notEqual(req.data, null)
      assert.notEqual(req.data.plans, null)
      assert.equal(req.data.plans[0].id, administrator.plan.id)
    })
  })

  describe('Plans#GET', () => {
    it('should have row for each plan', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 1000, trial_period_days: 0})
      const req = TestHelper.createRequest(`/administrator/subscriptions/plans`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        const tr = doc.getElementById(administrator.plan.id)
        assert.notEqual(null, tr)
      }
      return req.route.api.get(req, res)
    })

    it('should limit plans to one page', async () => {
      const user = await TestHelper.createUser()
      for (let i = 0, len = 10; i < len; i++) {
        await TestHelper.createResetCode(user)
      }
      const req = TestHelper.createRequest('/administrator/subscriptions/plans', 'GET')
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
      for (let i = 0, len = 10; i < len; i++) {
        await TestHelper.createResetCode(user)
      }
      const req = TestHelper.createRequest('/administrator/subscriptions/plans', 'GET')
      req.account = user.account
      req.session = user.session
      global.PAGE_SIZE = 8
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

    it('should enforce specified offset', async () => {
      const user = await TestHelper.createUser()
      const codes = [ user.code ]
      for (let i = 0, len = 10; i < len; i++) {
        await TestHelper.createResetCode(user)
        codes.unshift(user.code)
      }
      const req = TestHelper.createRequest('/administrator/subscriptions/plans?offset=10', 'GET')
      req.account = user.account
      req.session = user.session
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        assert.notEqual(null, doc)
        for (let i = 0, len = 10; i < len; i++) {
          assert.notEqual(null, doc.getElementById(codes[global.PAGE_SIZE + i].codeid))
        }
      }
      return req.route.api.get(req, res)
    })
  })
})
