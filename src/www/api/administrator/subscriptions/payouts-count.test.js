/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/administrator/subscriptions/payouts-count', async () => {
  describe('PayoutsCount#GET', () => {
    it('should count payouts', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPayout()
      await TestHelper.waitForWebhooks(2)
      await TestHelper.createPayout()
      await TestHelper.waitForWebhooks(4)
      await TestHelper.createPayout()
      await TestHelper.waitForWebhooks(6)
      const req = TestHelper.createRequest('/api/administrator/subscriptions/payouts-count', 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      const result = await req.route.api.get(req)
      assert.equal(result, 3)
    })
  })
})
