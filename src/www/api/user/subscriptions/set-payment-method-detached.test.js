/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')
const TestStripeAccounts = require('../../../../../test-stripe-accounts.js')

describe('/api/user/subscriptions/set-payment-method-detached', () => {
  describe('exceptions', () => {
    describe('invalid-paymentmethodid', () => {
      it('missing querystring paymentmethodid', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/subscriptions/set-payment-method-detached')
        req.account = user.account
        req.session = user.session
        let errorMessage
        try {
          await req.patch()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-paymentmethodid')
      })

      it('invalid querystring paymentmethodid', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/subscriptions/set-payment-method-detached?paymentmethodid=invalid')
        req.account = user.account
        req.session = user.session
        let errorMessage
        try {
          await req.patch()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-paymentmethodid')
      })
    })

    describe('invalid-account', () => {
      it('ineligible accessing account', async () => {
        const user = await TestStripeAccounts.createUserWithPaymentMethod()
        const user2 = await TestHelper.createUser()
        const req = TestHelper.createRequest(`/api/user/subscriptions/set-payment-method-detached?paymentmethodid=${user.paymentMethod.id}`)
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

    describe('invalid-paymentmethod', () => {
      it('invalid querystring payment method is default', async () => {
        const user = await TestStripeAccounts.createUserWithPaymentMethod()
        const req = TestHelper.createRequest(`/api/user/subscriptions/set-payment-method-detached?paymentmethodid=${user.paymentMethod.id}`)
        req.account = user.account
        req.session = user.session
        let errorMessage
        try {
          await req.patch()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-paymentmethod')
      })
    })
  })

  describe('returns', () => {
    it('object', async () => {
      const user = await TestStripeAccounts.createUserWithPaymentMethod()
      const paymentMethod1 = user.paymentMethod
      await TestHelper.createPaymentMethod(user, {
        cvc: '111',
        number: '4111111111111111',
        exp_month: '1',
        exp_year: (new Date().getFullYear() + 1).toString().substring(2),
        name: user.profile.firstName + ' ' + user.profile.lastName,
        address_line1: '285 Fulton St',
        address_line2: 'Apt 893',
        address_city: 'New York',
        address_state: 'NY',
        address_zip: '10007',
        address_country: 'US',
        default: 'true'
      })
      await TestHelper.waitForWebhook('customer.updated', (stripeEvent) => {
        return stripeEvent.data.object.invoice_settings.default_payment_method === user.paymentMethod.id
      })
      await TestHelper.waitForWebhook('payment_method.attached', (stripeEvent) => {
        return stripeEvent.data.object.id === user.paymentMethod.id
      })
      const req = TestHelper.createRequest(`/api/user/subscriptions/set-payment-method-detached?paymentmethodid=${paymentMethod1.id}`)
      req.account = user.account
      req.session = user.session
      req.filename = __filename
      req.saveResponse = true
      const paymentMethodNow = await req.patch()
      assert.strictEqual(paymentMethodNow.customer, null)
    })
  })
})
