/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')
const TestStripeAccounts = require('../../../../../test-stripe-accounts.js')

describe('/api/administrator/subscriptions/setup-intent', () => {
  after(TestHelper.deleteOldWebhooks)
  before(TestHelper.setupWebhook)
  describe('exceptions', () => {
    describe('invalid-setupintentid', () => {
      it('missing querystring setupintentid', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/subscriptions/setup-intent')
        req.account = administrator.account
        req.session = administrator.session
        let errorMessage
        try {
          await req.get()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-setupintentid')
      })

      it('invalid querystring setupintentid', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/subscriptions/setup-intent?setupintentid=invalid')
        req.account = administrator.account
        req.session = administrator.session
        let errorMessage
        try {
          await req.get()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-setupintentid')
      })
    })
  })

  describe('returns', () => {
    it('object', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestStripeAccounts.createUserWithPaymentMethod()
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/setup-intent?setupintentid=${user.setupIntent.id}`)
      req.account = administrator.account
      req.session = administrator.session
      req.filename = __filename
      req.saveResponse = true
      const setupIntent = await req.get()
      assert.strictEqual(setupIntent.id, user.setupIntent.id)
    })
  })
})
