/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/administrator/subscriptions/customers', () => {
  describe('Customers#BEFORE', () => {
    it('should bind customers to req', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 1000, trial_period_days: 0})
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, administrator.plan.id)
      const req = TestHelper.createRequest(`/administrator/subscriptions/customers`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      await req.route.api.before(req)
      assert.notEqual(req.data, null)
      assert.notEqual(req.data.customers, null)
      assert.equal(req.data.customers[0].id, user.customer.id)
    })
  })

  describe('Customers#GET', () => {
    it('should present the customers table', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 1000, trial_period_days: 0})
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, administrator.plan.id)
      const req = TestHelper.createRequest(`/administrator/subscriptions/customers`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        const tr = doc.getElementById(user.customer.id)
        assert.notEqual(null, tr)
      }
      return req.route.api.get(req, res)
    })

    it('should limit customers to one page', async () => {
      const user = await TestHelper.createUser()
      for (let i = 0, len = global.PAGE_SIZE + 1; i < len; i++) {
        await TestHelper.createResetCode(user)
      }
      const req = TestHelper.createRequest('/administrator/subscriptions/customers', 'GET')
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
      global.PAGE_SIZE = 3
      const user = await TestHelper.createUser()
      for (let i = 0, len = global.PAGE_SIZE + 1; i < len; i++) {
        await TestHelper.createResetCode(user)
      }
      const req = TestHelper.createRequest('/administrator/subscriptions/customers', 'GET')
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

    it('should enforce specified offset', async () => {
      const offset = 1
      const user = await TestHelper.createUser()
      const codes = [ user.code ]
      for (let i = 0, len = global.PAGE_SIZE + offset + 1; i < len; i++) {
        await TestHelper.createResetCode(user)
        codes.unshift(user.code)
      }
      const req = TestHelper.createRequest(`/administrator/subscriptions/customers?offset=${offset}`, 'GET')
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
