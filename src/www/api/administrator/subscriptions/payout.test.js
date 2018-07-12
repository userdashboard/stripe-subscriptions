/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/administrator/subscriptions/payout', () => {
  describe('Payout#GET', () => {
    it('should reject invalid payoutid', async () => {
      const administrator = await TestHelper.createAdministrator()
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/payout?payoutid=invalid`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      let errorMessage
      try {
        await req.route.api.get(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-payoutid')
    })

    it('should return payout data', async () => {
      const administrator = await TestHelper.createAdministrator()
      const payout = await TestHelper.createPayout()
      await TestHelper.waitForWebhooks(2)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/payout?payoutid=${payout.id}`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      const payoutNow = await req.route.api.get(req)
      assert.equal(payoutNow.id, payout.id)
    })
  })
})
