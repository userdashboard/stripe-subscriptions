/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')
const TestStripeAccounts = require('../../../../../test-stripe-accounts.js')

describe('/api/administrator/subscriptions/payment-intent', function () {
  this.timeout(60 * 60 * 1000)
  describe('exceptions', () => {
    describe('invalid-paymentintentid', () => {
      it('missing querystring paymentintentid', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/subscriptions/payment-intent')
        req.account = administrator.account
        req.session = administrator.session
        let errorMessage
        try {
          await req.get()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-paymentintentid')
      })

      it('invalid querystring paymentintentid', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/subscriptions/payment-intent?paymentintentid=invalid')
        req.account = administrator.account
        req.session = administrator.session
        let errorMessage
        try {
          await req.get()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-paymentintentid')
      })
    })
  })

  describe('returns', () => {
    it('object', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestStripeAccounts.createUserWithPaymentMethod()
      await TestHelper.createPaymentIntent(user, {
        amount: '10000',
        currency: 'usd',
        paymentmethodid: user.paymentMethod.id
      })
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/payment-intent?paymentintentid=${user.paymentIntent.id}`)
      req.account = administrator.account
      req.session = administrator.session
      req.filename = __filename
      req.saveResponse = true
      const paymentIntent = await req.get()
      assert.strictEqual(paymentIntent.id, user.paymentIntent.id)
    })
  })
})
