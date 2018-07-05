/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe(`/api/administrator/subscriptions/set-invoice-forgiven`, () => {
  describe('SetInvoiceForgiven#PATCH', () => {
    it('should reject invalid invoiceid', async () => {
      const administrator = await TestHelper.createAdministrator()
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/set-invoice-forgiven?invoiceid=invalid`, 'PATCH')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      let errorMessage
      try {
        await req.route.api.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-invoiceid')
    })

    it('should reject paid invoice', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 1000})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, administrator.plan.id)
      await TestHelper.waitForWebhooks(2)
      await TestHelper.loadInvoice(user, user.subscription.id)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/set-invoice-forgiven?invoiceid=${user.invoice.id}`, 'PATCH')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      let errorMessage
      try {
        await req.route.api.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-invoice')
    })

    it('should reject forgiven invoice', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan1 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 10000, trial_period_days: 0})
      const plan2 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 20000, trial_period_days: 0})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, plan1.id)
      await TestHelper.waitForWebhooks(2)
      await TestHelper.changeSubscriptionWithoutPaying(user, plan2.id)
      await TestHelper.waitForWebhooks(3)
      await TestHelper.loadInvoice(user, user.subscription.id)
      await TestHelper.forgiveInvoice(administrator, user.invoice.id)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/set-invoice-forgiven?invoiceid=${user.invoice.id}`, 'PATCH')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      let errorMessage
      try {
        await req.route.api.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-invoice')
    })

    it('should forgive invoice', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan1 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 10000, trial_period_days: 0})
      const plan2 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 20000, trial_period_days: 0})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, plan1.id)
      await TestHelper.waitForWebhooks(2)
      await TestHelper.changeSubscriptionWithoutPaying(user, plan2.id)
      await TestHelper.waitForWebhooks(3)
      await TestHelper.loadInvoice(user, user.subscription.id)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/set-invoice-forgiven?invoiceid=${user.invoice.id}`, 'PATCH')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      await req.route.api.patch(req)
      req.administratorSession = req.session = await TestHelper.unlockSession(administrator)
      const invoiceNow = await req.route.api.patch(req)
      assert.equal(invoiceNow.forgiven, true)
    })
  })
})
