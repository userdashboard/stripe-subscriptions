/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/administrator/subscriptions/payouts-count', async () => {
  describe('PayoutsCount#GET', () => {
    it('should count payouts', async () => {
      const administrator = await TestHelper.createAdministrator()
      const payout1 = await TestHelper.createPayout()
      await TestHelper.waitForNextItem(`payouts`, null)
      const payout2 = await TestHelper.createPayout()
      await TestHelper.waitForNextItem(`payouts`, payout1.id)
      await TestHelper.createPayout()
      await TestHelper.waitForNextItem(`payouts`, payout2.id)
      const req = TestHelper.createRequest('/api/administrator/subscriptions/payouts-count', 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      const result = await req.route.api.get(req)
      assert.equal(result, 3)
    })
  })
})
