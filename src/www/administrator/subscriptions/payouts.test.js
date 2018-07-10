/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe(`/api/administrator/subscriptions/payouts`, () => {
  describe('Payouts#BEFORE', () => {
    it('should bind payouts to req', async () => {
      const administrator = await TestHelper.createAdministrator()
      const payout1 = await TestHelper.createPayout()
      await TestHelper.waitForWebhooks(1)
      const payout2 = await TestHelper.createPayout()
      await TestHelper.waitForWebhooks(2)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/payouts`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      await req.route.api.before(req)
      assert.notEqual(req.data, null)
      assert.notEqual(req.data.payouts, null)
      assert.equal(req.data.payouts[0].id, payout2.id)
      assert.equal(req.data.payouts[1].id, payout1.id)
    })
  })

  describe('Payouts#GET', () => {
    it('should enforce page size', async () => {
      global.PAGE_SIZE = 3
      const user = await TestHelper.createUser()
      for (let i = 0, len = global.PAGE_SIZE + 1; i < len; i++) {
        await TestHelper.createPayout()
        await TestHelper.waitForWebhooks(i + 1)
      }
      const req = TestHelper.createRequest('/api/administrator/subscriptions/payouts', 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        assert.notEqual(null, doc)
        const table = doc.getElementById('payouts-table')
        const rows = table.getElementsByTagName('tr')
        assert.equal(rows.length, global.PAGE_SIZE + 1)
      }
      return req.route.api.get(req, res)
    })

    it('should enforce specified offset', async () => {
      const offset = 1
      const user = await TestHelper.createUser()
      const payouts = [ ]
      for (let i = 0, len = global.PAGE_SIZE + offset + 1; i < len; i++) {
        const payout = await TestHelper.createPayout()
        payouts.push(payout)
        await TestHelper.waitForWebhooks(i + 1)
      }
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/payouts?offset=${offset}`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        assert.notEqual(null, doc)
        for (let i = 0, len = global.PAGE_SIZE; i < len; i++) {
          assert.notEqual(null, doc.getElementById(payouts[offset + i].codeid))
        }
      }
      return req.route.api.get(req, res)
    })
  })
})
