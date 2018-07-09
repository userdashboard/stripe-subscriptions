/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/account/subscriptions/invoice', () => {
  describe('Invoice#BEFORE', () => {
    it('should reject invalid invoice', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      const req = TestHelper.createRequest('/account/subscriptions/invoice?invoiceid=invalid', 'POST')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      let errorMessage
      try {
        await req.route.api.before(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-invoiceid')
    })

    it('should reject other account\'s invoice', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 1000, trial_period_days: 0})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, administrator.plan.id)
      await TestHelper.waitForWebhooks(2)
      await TestHelper.loadInvoice(user, user.subscription.id)
      const user2 = await TestHelper.createUser()
      await TestHelper.createCustomer(user2)
      const req = TestHelper.createRequest(`/account/subscriptions/invoice?invoiceid=${user.invoice.id}`, 'POST')
      req.account = user2.account
      req.session = user2.session
      req.customer = user2.customer
      let errorMessage
      try {
        await req.route.api.before(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-account')
    })

    it('should bind invoice to req', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 1000, trial_period_days: 0})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, administrator.plan.id)
      await TestHelper.waitForWebhooks(2)
      await TestHelper.loadInvoice(user, user.subscription.id)
      const req = TestHelper.createRequest(`/account/subscriptions/invoice?invoiceid=${user.invoice.id}`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      await req.route.api.before(req)
      assert.notEqual(req.data, null)
      assert.notEqual(req.data.invoice, null)
      assert.equal(req.data.invoice.id, user.invoice.id)
    })
  })

  describe('Invoice#GET', () => {
    it('should have row for invoice', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 1000, trial_period_days: 0})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, administrator.plan.id)
      await TestHelper.waitForWebhooks(2)
      await TestHelper.loadInvoice(user, user.subscription.id)
      const req = TestHelper.createRequest(`/account/subscriptions/invoice?invoiceid=${user.invoice.id}`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        const tr = doc.getElementById(user.invoice.id)
        assert.notEqual(null, tr)
      }
      return req.route.api.get(req, res)
    })
  })
})
