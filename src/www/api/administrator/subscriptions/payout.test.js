/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/administrator/subscriptions/payout', function () {
  if (!process.env.DISABLE_PAYOUT_TESTS) {
    after(TestHelper.deleteOldWebhooks)
    before(TestHelper.setupWebhook)
    describe('exceptions', () => {
      describe('invalid-payoutid', () => {
        it('missing querystring payoutid', async () => {
          const administrator = await TestHelper.createOwner()
          const req = TestHelper.createRequest('/api/administrator/subscriptions/payout')
          req.account = administrator.account
          req.session = administrator.session
          let errorMessage
          try {
            await req.get()
          } catch (error) {
            errorMessage = error.message
          }
          assert.strictEqual(errorMessage, 'invalid-payoutid')
        })

        it('invalid querystring payoutid', async () => {
          const administrator = await TestHelper.createOwner()
          const req = TestHelper.createRequest('/api/administrator/subscriptions/payout?payoutid=invalid')
          req.account = administrator.account
          req.session = administrator.session
          let errorMessage
          try {
            await req.get()
          } catch (error) {
            errorMessage = error.message
          }
          assert.strictEqual(errorMessage, 'invalid-payoutid')
        })
      })
    })
    if (!process.env.DISABLE_PAYOUT_TESTS) {
      describe('returns', () => {
        it('object', async () => {
          const administrator = await TestHelper.createOwner()
          const payout = await TestHelper.createPayout(administrator)
          const req = TestHelper.createRequest(`/api/administrator/subscriptions/payout?payoutid=${payout.id}`)
          req.account = administrator.account
          req.session = administrator.session
          req.filename = __filename
          req.saveResponse = true
          const payoutNow = await req.get()
          assert.strictEqual(payoutNow.id, payout.id)
        })
      })
    }
  }
})
