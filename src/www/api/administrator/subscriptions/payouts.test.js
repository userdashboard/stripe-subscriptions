/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe(`/api/administrator/subscriptions/payouts`, () => {
  describe('Payouts#GET', () => {
    it('should return limit payouts to one page', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPayout()
      
      const payout2 = await TestHelper.createPayout()
      const payout3 = await TestHelper.createPayout()
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/payouts`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      const payouts = await req.route.api.get(req)
      assert.equal(payouts.length, 2)
      assert.equal(payouts[0].id, payout3.id)
      assert.equal(payouts[1].id, payout2.id)
    })
  })
})
