/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/administrator/subscriptions/invoices', () => {
  describe('Invoices#BEFORE', () => {
    it('should bind invoices to req', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 1000, trial_period_days: 0})
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, administrator.plan.id)
      const req = TestHelper.createRequest(`/administrator/subscriptions/invoices`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      await req.route.api.before(req)
      assert.notEqual(req.data, null)
      assert.notEqual(req.data.invoices, null)
      assert.equal(req.data.invoices[0].id, user.invoice.id)
    })
  })

  describe('Invoices#GET', () => {
    it('should limit invoices to one page', async () => {
      const user = await TestHelper.createUser()
      for (let i = 0, len = global.PAGE_SIZE + 1; i < len; i++) {
        await TestHelper.createResetCode(user)
      }
      const req = TestHelper.createRequest('/administrator/subscriptions/invoices', 'GET')
      req.account = user.account
      req.session = user.session
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        assert.notEqual(null, doc)
        const table = doc.getElementById('invoices-table')
        const rows = table.getElementsByTagName('tr')
        assert.equal(rows.length, global.PAGE_SIZE + 1)
      }
      return req.route.api.get(req, res)
    })

    it('should enforce page size', async () => {
      global.PAGE_SIZE = 3
      const user = await TestHelper.createUser()
      for (let i = 0, len = global.PAGE_SIZE + 1; i < len; i++) {
        await TestHelper.createResetCode(user)
      }
      const req = TestHelper.createRequest('/administrator/subscriptions/invoices', 'GET')
      req.account = user.account
      req.session = user.session
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        assert.notEqual(null, doc)
        const table = doc.getElementById('invoices-table')
        const rows = table.getElementsByTagName('tr')
        assert.equal(rows.length, global.PAGE_SIZE + 1)
      }
      return req.route.api.get(req, res)
    })

    it('should enforce specified offset', async () => {
      const offset = 1
      const user = await TestHelper.createUser()
      const codes = [ user.code ]
      for (let i = 0, len = global.PAGE_SIZE + offset + 1; i < len; i++) {
        await TestHelper.createResetCode(user)
        codes.unshift(user.code)
      }
      const req = TestHelper.createRequest(`/administrator/subscriptions/invoices?offset=${offset}`, 'GET')
      req.account = user.account
      req.session = user.session
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        assert.notEqual(null, doc)
        for (let i = 0, len = global.PAGE_SIZE; i < len; i++) {
          assert.notEqual(null, doc.getElementById(codes[offset + i].codeid))
        }
      }
      return req.route.api.get(req, res)
    })
  })
})
