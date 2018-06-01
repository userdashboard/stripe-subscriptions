/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe(`/api/administrator/subscriptions/payouts`, () => {
  describe('Payouts#GET', () => {
    it('should return all payouts list', async () => {
      const administrator = await TestHelper.createAdministrator()
      const payout1 = await TestHelper.createPayout()
      const payout2 = await TestHelper.createPayout()
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/payouts`, 'GET')
      req.account = administrator.account
      req.session = administrator.session
      const payouts = await req.route.api.get(req)
      assert.equal(true, payouts.length >= 2)
      assert.equal(payouts[0].id, payout2.id)
      assert.equal(payouts[1].id, payout1.id)
    })
  })
})
