/* eslint-env mocha */
const assert = require('assert')
const dashboard = require('@userdashboard/dashboard')
const RequirePayment = require('./require-payment.js')
const TestHelper = require('../../../test-helper.js')
const TestStripeAccounts = require('../../../test-stripe-accounts.js')

describe('server/stripe-subscriptions/require-payment', () => {
  describe('after', function () {
    afterEach(TestHelper.deleteOldWebhooks)
    beforeEach(TestHelper.setupWebhook)
    it('should ignore guests', async () => {
      global.requirePayment = true
      const req = TestHelper.createRequest('/')
      const res = {}
      let result
      res.end = (str) => {
        result = str
      }
      await RequirePayment.after(req, res)
      assert.strictEqual(result, undefined)
    })

    it('should ignore user with amount owed requesting account pages', async () => {
      const user = await TestHelper.createUser()
      global.requirePayment = true
      await TestHelper.toggleOverdueInvoiceThreshold(false)
      await TestHelper.createCustomer(user, {
        email: user.profile.contactEmail,
        description: user.profile.firstName,
        country: 'US'
      })
      await TestHelper.createAmountOwed(user)
      const req = TestHelper.createRequest('/account/change-password')
      req.account = user.account
      req.session = user.session
      const res = {}
      let result
      res.end = (str) => {
        result = str
      }
      await RequirePayment.after(req, res)
      assert.strictEqual(result, undefined)
    })

    it('should ignore administrator with amount owed requesting administration pages', async () => {
      const administrator = await TestHelper.createOwner()
      global.requirePayment = true
      await TestHelper.toggleOverdueInvoiceThreshold(false)
      await TestHelper.createCustomer(administrator, {
        email: administrator.profile.contactEmail,
        description: administrator.profile.firstName,
        country: 'US'
      })
      await TestHelper.createAmountOwed(administrator)
      global.requirePayment = true
      const req = TestHelper.createRequest('/administrator/subscriptions')
      req.account = administrator.account
      req.session = administrator.session
      const res = {}
      let result
      res.end = (str) => {
        result = str
      }
      await RequirePayment.after(req, res)
      assert.strictEqual(result, undefined)
    })

    it('should ignore user without amount owed', async () => {
      const user = await TestHelper.createUser()
      global.requirePayment = true
      await TestHelper.toggleOverdueInvoiceThreshold(false)
      const req = TestHelper.createRequest('/home')
      req.account = user.account
      req.session = user.session
      let result
      const res = {}
      res.end = (str) => {
        result = str
      }
      await RequirePayment.after(req, res)
      assert.strictEqual(result, undefined)
    })

    it('should ignore user with open but not overdue invoice', async () => {
      const administrator = await TestStripeAccounts.createOwnerWithPlan({ trial_period_days: 1 })
      await TestHelper.toggleOverdueInvoiceThreshold(false)
      const user = await TestStripeAccounts.createUserWithPaymentMethod()
      await TestHelper.createSubscription(user, administrator.plan.id)
      global.requirePayment = true
      await TestHelper.toggleOverdueInvoiceThreshold(true)
      const req = TestHelper.createRequest('/home')
      req.account = user.account
      req.session = user.session
      let result
      const res = {}
      res.setHeader = () => { }
      res.end = (str) => {
        result = str
      }
      await RequirePayment.after(req, res)
      assert.strictEqual(result, undefined)
    })

    it('should require user pay overdue invoice', async () => {
      const user = await TestStripeAccounts.createUserWithPaymentMethod()
      let wait = 10
      while (true) {
        try {
          await TestHelper.createAmountOwed(user, user.paymentMethod.created + wait)
          break
        } catch (error) {
          wait++
        }
      }
      await TestHelper.waitForWebhook('invoice.updated', (stripeEvent) => {
        return stripeEvent.data.object.id === user.invoice.id
      })
      await TestHelper.waitForWebhook('payment_intent.created', (stripeEvent) => {
        return stripeEvent.data.object.invoice === user.invoice.id
      })
      global.requirePayment = true
      await TestHelper.toggleOverdueInvoiceThreshold(false)
      dashboard.Timestamp.now = user.paymentMethod.created + wait + 1
      const req = TestHelper.createRequest('/home')
      req.account = user.account
      req.session = user.session
      let redirectURL
      const res = {}
      res.setHeader = () => {
      }
      res.end = (str) => {
        const doc = dashboard.HTML.parse(str)
        redirectURL = TestHelper.extractRedirectURL(doc)
      }
      await RequirePayment.after(req, res)
      assert.strictEqual(redirectURL, `/account/subscriptions/pay-invoice?invoiceid=${user.invoice.id}&return-url=/home`)
    })
  })
})
