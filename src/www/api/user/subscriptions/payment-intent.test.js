/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')
const TestStripeAccounts = require('../../../../../test-stripe-accounts.js')

describe('/api/user/subscriptions/payment-intent', () => {
  describe('exceptions', () => {
    describe('invalid-paymentintentid', () => {
      it('missing querystring invalid', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/subscriptions/payment-intent')
        req.account = user.account
        req.session = user.session
        let errorMessage
        try {
          await req.get()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-paymentintentid')
      })

      it('invalid querystring invalid', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/subscriptions/payment-intent?paymentintentid=invalid')
        req.account = user.account
        req.session = user.session
        let errorMessage
        try {
          await req.get()
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
        const req = TestHelper.createRequest(`/api/user/subscriptions/payment-intent?paymentintentid=${user.paymentIntent.id}`)
        req.account = user2.account
        req.session = user2.session
        let errorMessage
        try {
          await req.get()
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
      const req = TestHelper.createRequest(`/api/user/subscriptions/payment-intent?paymentintentid=${user.paymentIntent.id}`)
      req.account = user.account
      req.session = user.session
      req.filename = __filename
      req.saveResponse = true
      const paymentIntent = await req.get()
      assert.strictEqual(paymentIntent.id, user.paymentIntent.id)
    })
  })
})
