/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')
const TestStripeAccounts = require('../../../../../test-stripe-accounts.js')

describe('/api/administrator/subscriptions/set-invoice-uncollectible', function () {
  this.timeout(60 * 60 * 1000)
  before(TestHelper.setupWebhook)
  after(TestHelper.deleteOldWebhooks)
  describe('exceptions', () => {
    describe('invalid-invoiceid', () => {
      it('missing querystring invoiceid', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/subscriptions/set-invoice-uncollectible?invoiceid=invalid')
        req.account = administrator.account
        req.session = administrator.session
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-invoiceid')
      })

      it('invalid querystring invoiceid', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/subscriptions/set-invoice-uncollectible?invoiceid=invalid')
        req.account = administrator.account
        req.session = administrator.session
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-invoiceid')
      })
    })

    describe('invalid-invoice', () => {
      it('invalid querystring invoice is paid', async () => {
        const administrator = await TestStripeAccounts.createOwnerWithPlan()
        const user = await TestStripeAccounts.createUserWithPaymentMethod()
        await TestHelper.createSubscription(user, administrator.plan.id)
        const req = TestHelper.createRequest(`/api/administrator/subscriptions/set-invoice-uncollectible?invoiceid=${user.invoice.id}`)
        req.account = administrator.account
        req.session = administrator.session
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
        const req = TestHelper.createRequest(`/api/administrator/subscriptions/set-invoice-uncollectible?invoiceid=${user.invoice.id}`)
        req.account = administrator.account
        req.session = administrator.session
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-invoice')
      })
    })
  })
  describe('returns', () => {
    it('object', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestStripeAccounts.createUserWithPaymentMethod()
      await TestHelper.createAmountOwed(user)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/set-invoice-uncollectible?invoiceid=${user.invoice.id}`)
      req.account = administrator.account
      req.session = administrator.session
      req.filename = __filename
      req.saveResponse = true
      const invoiceNow = await req.patch()
      assert.strictEqual(invoiceNow.status, 'uncollectible')
    })
  })
})
