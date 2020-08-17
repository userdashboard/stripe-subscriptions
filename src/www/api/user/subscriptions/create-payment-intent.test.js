/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')
const TestStripeAccounts = require('../../../../../test-stripe-accounts.js')

describe('/api/user/subscriptions/create-payment-intent', () => {
  describe('exceptions', () => {
    describe('invalid-customerid', () => {
      it('missing querystring customerid', async () => {
        global.stripeJS = false
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/subscriptions/create-payment-intent')
        req.account = user.account
        req.session = user.session
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-customerid')
      })

      it('invalid querystring customerid', async () => {
        global.stripeJS = false
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/subscriptions/create-payment-intent?customerid=invalid')
        req.account = user.account
        req.session = user.session
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-customerid')
      })
    })

    describe('invalid-account', () => {
      it('ineligible accessing account', async () => {
        global.stripeJS = false
        const user = await TestStripeAccounts.createUserWithPaymentMethod()
        const user2 = await TestHelper.createUser()
        const req = TestHelper.createRequest(`/api/user/subscriptions/create-payment-intent?customerid=${user.customer.id}`)
        req.account = user2.account
        req.session = user2.session
        req.body = {
          paymentmethodid: user.paymentMethod.id,
          amount: '10000',
          currency: 'usd'
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-account')
      })

      it('ineligible posted payment method', async () => {
        global.stripeJS = false
        const user = await TestHelper.createUser()
        await TestHelper.createCustomer(user, {
          email: user.profile.contactEmail,
          description: user.profile.firstName,
          country: 'US'
        })
        const user2 = await TestStripeAccounts.createUserWithPaymentMethod()
        const req = TestHelper.createRequest(`/api/user/subscriptions/create-payment-intent?customerid=${user.customer.id}`)
        req.account = user2.account
        req.session = user2.session
        req.body = {
          paymentmethodid: user2.paymentMethod.id,
          amount: '10000',
          currency: 'usd'
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-account')
      })
    })

    describe('invalid-paymentmethodid', () => {
      it('missing posted paymentmethodid', async () => {
        global.stripeJS = false
        const user = await TestHelper.createUser()
        await TestHelper.createCustomer(user, {
          email: user.profile.contactEmail,
          description: user.profile.firstName,
          country: 'US'
        })
        const req = TestHelper.createRequest(`/api/user/subscriptions/create-payment-intent?customerid=${user.customer.id}`)
        req.account = user.account
        req.session = user.session
        req.body = {
          paymentmethodid: ''
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-paymentmethodid')
      })

      it('invalid posted paymentmethodid', async () => {
        global.stripeJS = false
        const user = await TestHelper.createUser()
        await TestHelper.createCustomer(user, {
          email: user.profile.contactEmail,
          description: user.profile.firstName,
          country: 'US'
        })
        const req = TestHelper.createRequest(`/api/user/subscriptions/create-payment-intent?customerid=${user.customer.id}`)
        req.account = user.account
        req.session = user.session
        req.body = {
          paymentmethodid: 'invalid'
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-paymentmethodid')
      })
    })
  })

  describe('object', () => {
    it('object', async () => {
      global.stripeJS = false
      const user = await TestStripeAccounts.createUserWithPaymentMethod()
      const req = TestHelper.createRequest(`/api/user/subscriptions/create-payment-intent?customerid=${user.customer.id}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        paymentmethodid: user.paymentMethod.id,
        amount: '10000',
        currency: 'usd'
      }
      const paymentIntent = await req.post()
      assert.strictEqual(paymentIntent.object, 'payment_intent')
    })
  })
})
