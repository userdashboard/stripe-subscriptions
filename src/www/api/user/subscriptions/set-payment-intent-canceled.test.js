/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')
const TestStripeAccounts = require('../../../../../test-stripe-accounts.js')

describe('/api/user/subscriptions/set-payment-intent-canceled', () => {
  describe('exceptions', () => {
    describe('invalid-paymentintentid', () => {
      it('missing querystring paymentintentid', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/subscriptions/set-payment-intent-canceled')
        req.account = user.account
        req.session = user.session
        let errorMessage
        try {
          await req.patch()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-paymentintentid')
      })

      it('invalid querystring paymentintentid', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/subscriptions/set-payment-intent-canceled?paymentintentid=invalid')
        req.account = user.account
        req.session = user.session
        let errorMessage
        try {
          await req.patch()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-paymentintentid')
      })
    })

    describe('invalid-account', () => {
      it('ineligible accessing account', async () => {
        const user = await TestStripeAccounts.createUserWithPaymentMethod()
        await TestHelper.createPaymentIntent(user, {
          amount: '10000',
          currency: 'usd',
          paymentmethodid: user.paymentMethod.id
        })
        const user2 = await TestHelper.createUser()
        const req = TestHelper.createRequest(`/api/user/subscriptions/set-payment-intent-canceled?paymentintentid=${user.paymentIntent.id}`)
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
      await TestHelper.createPaymentIntent(user, {
        amount: '10000',
        currency: 'usd',
        paymentmethodid: user.paymentMethod.id
      })
      const req = TestHelper.createRequest(`/api/user/subscriptions/set-payment-intent-canceled?paymentintentid=${user.paymentIntent.id}`)
      req.account = user.account
      req.session = user.session
      req.filename = __filename
      req.saveResponse = true
      const paymentIntentNow = await req.patch()
      assert.strictEqual(paymentIntentNow.status, 'canceled')
    })
  })
})
