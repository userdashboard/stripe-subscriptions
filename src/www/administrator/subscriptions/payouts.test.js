/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../test-helper.js')

describe(`/administrator/subscriptions/payouts`, () => {
  describe('Payouts#BEFORE', () => {
    it('should bind payouts to req', async () => {
      const administrator = await TestHelper.createAdministrator()
      const payout1 = await TestHelper.createPayout()
      const payout2 = await TestHelper.createPayout()
      const req = TestHelper.createRequest(`/administrator/subscriptions/payouts`, 'GET')
      req.account = administrator.account
      req.session = administrator.session
      await req.route.api.before(req)
      assert.notEqual(req.data, null)
      assert.notEqual(req.data.payouts, null)
      assert.equal(req.data.payouts[0].id, payout2.id)
      assert.equal(req.data.payouts[1].id, payout1.id)
    })
  })

  describe('Payouts#GET', () => {
    it('should have row for each payout', async () => {
      const administrator = await TestHelper.createAdministrator()
      const payout1 = await TestHelper.createPayout()
      const payout2 = await TestHelper.createPayout()
      const req = TestHelper.createRequest(`/administrator/subscriptions/payouts`, 'GET')
      req.account = administrator.account
      req.session = administrator.session
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        assert.notEqual(null, doc)
        const payout1Row = doc.getElementById(payout1.id)
        assert.notEqual(null, payout1Row)
        const payout2Row = doc.getElementById(payout2.id)
        assert.notEqual(null, payout2Row)
      }
      return req.route.api.get(req, res)
    })
  })
})
