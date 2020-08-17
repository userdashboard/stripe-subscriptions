/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')
const TestStripeAccounts = require('../../../../../test-stripe-accounts.js')

describe('/api/user/subscriptions/set-setup-intent-canceled', function () {
  this.timeout(60 * 60 * 1000)
  after(TestHelper.deleteOldWebhooks)
  before(TestHelper.setupWebhook)
  describe('exceptions', () => {
    describe('invalid-setupintentid', () => {
      it('missing querystring setupintentid', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/subscriptions/set-setup-intent-canceled')
        req.account = user.account
        req.session = user.session
        let errorMessage
        try {
          await req.patch()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-setupintentid')
      })

      it('invalid querystring setupintentid', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/subscriptions/set-setup-intent-canceled?setupintentid=invalid')
        req.account = user.account
        req.session = user.session
        let errorMessage
        try {
          await req.patch()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-setupintentid')
      })
    })

    describe('invalid-account', () => {
      it('ineligible accessing account', async () => {
        const user = await TestStripeAccounts.createUserWithPaymentMethod()
        const user2 = await TestHelper.createUser()
        const req = TestHelper.createRequest(`/api/user/subscriptions/set-setup-intent-canceled?setupintentid=${user.setupIntent.id}`)
        req.account = user2.account
        req.session = user2.session
        let errorMessage
        try {
          await req.patch()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-account')
      })
    })
  })

  describe('returns', () => {
    it('object', async () => {
      const user = await TestStripeAccounts.createUserWithPaymentMethod()
      const req = TestHelper.createRequest(`/api/user/subscriptions/set-setup-intent-canceled?setupintentid=${user.setupIntent.id}`)
      req.account = user.account
      req.session = user.session
      req.filename = __filename
      req.saveResponse = true
      const setupIntentNow = await req.patch()
      assert.strictEqual(setupIntentNow.status, 'canceled')
    })
  })
})
