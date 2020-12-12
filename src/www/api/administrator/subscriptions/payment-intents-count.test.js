/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')
const TestStripeAccounts = require('../../../../../test-stripe-accounts.js')

describe('/api/administrator/subscriptions/payment-intents-count', function () {
  describe('returns', () => {
    it('integer', async () => {
      const administrator = await TestHelper.createOwner()
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        const user = await TestStripeAccounts.createUserWithPaymentMethod()
        await TestHelper.createPaymentIntent(user, {
          amount: '30000',
          currency: 'usd',
          paymentmethodid: user.paymentMethod.id
        })
      }
      const req = TestHelper.createRequest('/api/administrator/subscriptions/payment-intents-count')
      req.account = administrator.account
      req.session = administrator.session
      req.filename = __filename
      req.saveResponse = true
      const result = await req.get()
      assert.strictEqual(result, global.pageSize + 1)
    })
  })
})
