/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe(`/administrator/subscriptions/payouts`, () => {
  describe('Payouts#BEFORE', () => {
    it('should bind payouts to req', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createExternalAccount(administrator, {currency: 'usd', country: 'US', account_holder_name: 'Person', account_type: 'individual', account_number: '000123456789', routing_number: '110000000'})
      const payout1 = await TestHelper.createPayout()
      await TestHelper.waitForNextItem(`payouts`, null)
      const payout2 = await TestHelper.createPayout()
      await TestHelper.waitForNextItem(`payouts`, payout1.id)
      const req = TestHelper.createRequest(`/administrator/subscriptions/payouts`, 'GET')
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
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createExternalAccount(administrator, {currency: 'usd', country: 'US', account_holder_name: 'Person', account_type: 'individual', account_number: '000123456789', routing_number: '110000000'})
      let lastid
      for (let i = 0, len = global.PAGE_SIZE + 1; i < len; i++) {
        const payout = await TestHelper.createPayout()
        await TestHelper.waitForNextItem(`payouts`, lastid)
        lastid = payout.id
      }
      const req = TestHelper.createRequest('/administrator/subscriptions/payouts', 'GET')
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
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createExternalAccount(administrator, {currency: 'usd', country: 'US', account_holder_name: 'Person', account_type: 'individual', account_number: '000123456789', routing_number: '110000000'})
      const payouts = []
      let lastid
      for (let i = 0, len = global.PAGE_SIZE + offset + 1; i < len; i++) {
        const payout = await TestHelper.createPayout()
        await TestHelper.waitForNextItem(`payouts`, lastid)
        payouts.unshift(payout)
        lastid = payout.id
      }
      const req = TestHelper.createRequest(`/administrator/subscriptions/payouts?offset=${offset}`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        assert.notEqual(null, doc)
        for (let i = 0, len = global.PAGE_SIZE; i < len; i++) {
          assert.notEqual(null, doc.getElementById(payouts[offset + i].id))
        }
      }
      return req.route.api.get(req, res)
    })
  })
})
