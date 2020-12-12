/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')
const TestStripeAccounts = require('../../../../../test-stripe-accounts.js')

describe('/api/user/subscriptions/set-invoice-paid', function () {
  afterEach(TestHelper.deleteOldWebhooks)
  beforeEach(TestHelper.setupWebhook)
  describe('exceptions', () => {
    describe('invalid-invoiceid', () => {
      it('missing querystring invoiceid', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/subscriptions/set-invoice-paid')
        req.account = user.account
        req.session = user.session
        req.body = {
          paymentmethodid: 'invalid'
        }
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-invoiceid')
      })

      it('invalid querystring invoiceid', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/subscriptions/set-invoice-paid?invoiceid=invalid')
        req.account = user.account
        req.session = user.session
        req.body = {
          paymentmethodid: 'invalid'
        }
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-invoiceid')
      })
    })

    describe('invalid-account', () => {
      it('ineligible accessing account', async () => {
        const user = await TestHelper.createUser()
        await TestHelper.createCustomer(user, {
          email: user.profile.contactEmail,
          description: user.profile.firstName,
          country: 'US'
        })
        await TestHelper.createAmountOwed(user)
        const user2 = await TestHelper.createUser()
        const req = TestHelper.createRequest(`/api/user/subscriptions/set-invoice-paid?invoiceid=${user.invoice.id}`)
        req.account = user2.account
        req.session = user2.session
        req.body = {
          paymentmethodid: 'invalid'
        }
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-account')
      })

      it('ineligible posted payment method', async () => {
        const user = await TestStripeAccounts.createUserWithPaymentMethod()
        await TestHelper.createAmountOwed(user)
        const user2 = await TestStripeAccounts.createUserWithPaymentMethod()
        const req = TestHelper.createRequest(`/api/user/subscriptions/set-invoice-paid?invoiceid=${user.invoice.id}`)
        req.account = user.account
        req.session = user.session
        req.body = {
          paymentmethodid: user2.paymentMethod.id
        }
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-account')
      })
    })

    describe('invalid-invoice', () => {
      it('invalid querystring invoice is paid', async () => {
        const administrator = await TestStripeAccounts.createOwnerWithPlan({ amount: '1000', interval: 'month' })
        const user = await TestStripeAccounts.createUserWithPaymentMethod()
        await TestHelper.createSubscription(user, administrator.plan.id)
        const req = TestHelper.createRequest(`/api/user/subscriptions/set-invoice-paid?invoiceid=${user.invoice.id}`)
        req.account = user.account
        req.session = user.session
        req.body = {
          paymentmethodid: user.paymentMethod.id
        }
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-invoice')
      })

      it('invalid querystring invoice is marked uncollectable', async () => {
        const administrator = await TestHelper.createOwner()
        const user = await TestStripeAccounts.createUserWithPaymentMethod()
        await TestHelper.createAmountOwed(user)
        await TestHelper.forgiveInvoice(administrator, user.invoice.id)
        const req = TestHelper.createRequest(`/api/user/subscriptions/set-invoice-paid?invoiceid=${user.invoice.id}`)
        req.account = user.account
        req.session = user.session
        req.body = {
          paymentmethodid: user.paymentMethod.id
        }
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-invoice')
      })
    })

    describe('invalid-paymentmethodid', () => {
      it('missing posted paymentmethodid', async () => {
        const user = await TestHelper.createUser()
        await TestHelper.createCustomer(user, {
          email: user.profile.contactEmail,
          description: user.profile.firstName,
          country: 'US'
        })
        await TestHelper.createAmountOwed(user)
        const req = TestHelper.createRequest(`/api/user/subscriptions/set-invoice-paid?invoiceid=${user.invoice.id}`)
        req.account = user.account
        req.session = user.session
        req.body = {
          paymentmethodid: ''
        }
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-paymentmethodid')
      })

      it('invalid posted paymentmethodid', async () => {
        const user = await TestHelper.createUser()
        await TestHelper.createCustomer(user, {
          email: user.profile.contactEmail,
          description: user.profile.firstName,
          country: 'US'
        })
        await TestHelper.createAmountOwed(user)
        const req = TestHelper.createRequest(`/api/user/subscriptions/set-invoice-paid?invoiceid=${user.invoice.id}`)
        req.account = user.account
        req.session = user.session
        req.body = {
          paymentmethodid: 'invalid'
        }
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-paymentmethodid')
      })
    })
  })

  describe('returns', () => {
    it('object', async () => {
      const user = await TestStripeAccounts.createUserWithPaymentMethod()
      await TestHelper.createAmountOwed(user)
      const req = TestHelper.createRequest(`/api/user/subscriptions/set-invoice-paid?invoiceid=${user.invoice.id}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        paymentmethodid: user.paymentMethod.id
      }
      req.filename = __filename
      req.saveResponse = true
      const invoice = await req.patch()
      assert.strictEqual(invoice.paid, true)
    })
  })
})
