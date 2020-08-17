/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')
const TestStripeAccounts = require('../../../../test-stripe-accounts.js')

describe('/account/subscriptions/confirm-payment', function () {
  after(TestHelper.deleteOldWebhooks)
  before(TestHelper.setupWebhook)
  describe('before', () => {
    it('should bind data to req', async () => {
      const administrator = await TestStripeAccounts.createOwnerWithPlan()
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user, {
        email: user.profile.contactEmail,
        description: user.profile.firstName,
        country: 'US'
      })
      await TestHelper.createPaymentMethod(user, {
        cvc: '111',
        number: '4000002760003184',
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
      global.requirePaymentConfirmation = true
      await TestHelper.createSubscription(user, administrator.plan.id)
      await TestHelper.waitForWebhook('payment_intent.created', (stripeEvent) => {
        return stripeEvent.data.object.invoice === user.invoice.id
      })
      await TestHelper.waitForWebhook('invoice.payment_action_required', (stripeEvent) => {
        return stripeEvent.data.object.id === user.invoice.id
      })
      const req = TestHelper.createRequest(`/account/subscriptions/confirm-payment?invoiceid=${user.invoice.id}`)
      req.account = user.account
      req.session = user.session
      await req.route.api.before(req)
      assert.strictEqual(req.data.paymentIntent.object, 'payment_intent')
    })
  })

  // TODO: this test only works if you have SHOW_BROWSERS
  // and manually click the conirmation button
  describe('view', () => {
    it('should display stripe.js confirmation', async () => {
      if (!process.env.SHOW_BROWSERS) {
        return assert.strictEqual(1, 1)
      }
      const administrator = await TestStripeAccounts.createOwnerWithPlan()
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user, {
        email: user.profile.contactEmail,
        description: user.profile.firstName,
        country: 'US'
      })
      await TestHelper.createPaymentMethod(user, {
        cvc: '111',
        number: '4000002760003184',
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
      global.requirePaymentConfirmation = true
      await TestHelper.createSubscription(user, administrator.plan.id)
      await TestHelper.waitForWebhook('payment_intent.created', (stripeEvent) => {
        return stripeEvent.data.object.invoice === user.invoice.id
      })
      await TestHelper.waitForWebhook('invoice.payment_action_required', (stripeEvent) => {
        return stripeEvent.data.object.id === user.invoice.id
      })
      const req = TestHelper.createRequest(`/account/subscriptions/confirm-payment?invoiceid=${user.invoice.id}`)
      req.account = user.account
      req.session = user.session
      const result = await req.get()
      assert.strictEqual(result.redirect, `/account/subscriptions/invoice?invoiceid=${user.invoice.id}`)
    })
  })
})
