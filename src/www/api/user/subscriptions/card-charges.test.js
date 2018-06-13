/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/user/subscriptions/card-charges', () => {
  describe('CardCharges#GET', () => {
    it('should return list of charges on card', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true})
      const plan1 = administrator.plan
      await TestHelper.createPlan(administrator, {published: true})
      const plan2 = administrator.plan
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, plan1.id)
      const invoice1 = user.invoice
      await TestHelper.createSubscription(user, plan2.id)
      const invoice2 = user.invoice
      const req = TestHelper.createRequest(`/api/user/subscriptions/card-charges?cardid=${user.card.id}`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const charges = await req.route.api.get(req)
      assert.equal(charges.length >= 2, true)
      assert.equal(charges[0].amount, plan2.amount)
      assert.equal(charges[0].invoice, invoice2.id)
      assert.equal(charges[1].amount, plan1.amount)
      assert.equal(charges[1].invoice, invoice1.id)
    })

    it('should limit card\'s charges to one page', async () => {
      const user = await TestHelper.createUser()
      for (let i = 0, len = 20; i < len; i++) {
        await TestHelper.createResetCode(user)
      }
      const req = TestHelper.createRequest('/account/subscriptions/card-charges', 'GET')
      req.account = user.account
      req.session = user.session
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        assert.notEqual(null, doc)
        const table = doc.getElementById('subscriptions/card-charges-table')
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
      const req = TestHelper.createRequest('/account/subscriptions/card-charges', 'GET')
      req.account = user.account
      req.session = user.session
      global.PAGE_SIZE = 8
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        assert.notEqual(null, doc)
        const table = doc.getElementById('subscriptions/card-charges-table')
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
      const req = TestHelper.createRequest('/account/subscriptions/card-charges?offset=10', 'GET')
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
