/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe(`/account/subscriptions/refund-invoice`, async () => {
  describe('RefundInvoice#BEFORE', () => {
    it('should reject invalid invoice', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      const req = TestHelper.createRequest('/account/subscriptions/refund-invoice?invoiceid=invalid', 'POST')
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
      const invoiceid = await TestHelper.waitForNextItem(`subscription:invoices:${user.subscription.id}`, null)
      const user2 = await TestHelper.createUser()
      await TestHelper.createCustomer(user2)
      const req = TestHelper.createRequest(`/account/subscriptions/refund-invoice?invoiceid=${invoiceid}`, 'POST')
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
      await TestHelper.waitForNextItem(`subscription:charges:${user.subscription.id}`, null)
      const invoiceid = await TestHelper.waitForNextItem(`subscription:invoices:${user.subscription.id}`, null)
      const req = TestHelper.createRequest(`/account/subscriptions/refund-invoice?invoiceid=${invoiceid}`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      await req.route.api.before(req)
      assert.notEqual(req.data, null)
      assert.notEqual(req.data.invoice, null)
      assert.equal(req.data.invoice.id, invoiceid)
    })

    it('should bind charge to req', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 1000, trial_period_days: 0})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, administrator.plan.id)
      await TestHelper.waitForNextItem(`subscription:charges:${user.subscription.id}`, null)
      const invoiceid = await TestHelper.waitForNextItem(`subscription:invoices:${user.subscription.id}`, null)
      const req = TestHelper.createRequest(`/account/subscriptions/refund-invoice?invoiceid=${invoiceid}`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      await req.route.api.before(req)
      assert.notEqual(req.data, null)
      assert.notEqual(req.data.charge, null)
      assert.equal(req.data.charge.invoice, invoiceid)
    })
  })

  describe('RefundInvoice#GET', () => {
    it('should present the form', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 1000, trial_period_days: 0})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, administrator.plan.id)
      await TestHelper.waitForNextItem(`subscription:charges:${user.subscription.id}`, null)
      const invoiceid = await TestHelper.waitForNextItem(`subscription:invoices:${user.subscription.id}`, null)
      const req = TestHelper.createRequest(`/account/subscriptions/refund-invoice?invoiceid=${invoiceid}`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        assert.notEqual(null, doc)
        assert.notEqual(null, doc.getElementById('submit-form'))
        assert.notEqual(null, doc.getElementById('submit-button'))
      }
      return req.route.api.get(req, res)
    })

    it('should present the invoice table', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 1000, trial_period_days: 0})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, administrator.plan.id)
      await TestHelper.waitForNextItem(`subscription:charges:${user.subscription.id}`, null)
      const invoiceid = await TestHelper.waitForNextItem(`subscription:invoices:${user.subscription.id}`, null)
      const req = TestHelper.createRequest(`/account/subscriptions/refund-invoice?invoiceid=${invoiceid}`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        const tr = doc.getElementById(invoiceid)
        assert.notEqual(null, tr)
      }
      return req.route.api.get(req, res)
    })
  })

  describe('RefundInvoice#PATCH', () => {
    it('should apply after authorization', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 1000, trial_period_days: 0})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, administrator.plan.id)
      await TestHelper.waitForNextItem(`subscription:charges:${user.subscription.id}`, null)
      const invoiceid = await TestHelper.waitForNextItem(`subscription:invoices:${user.subscription.id}`, null)
      const req = TestHelper.createRequest(`/account/subscriptions/refund-invoice?invoiceid=${invoiceid}`, 'POST')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      req.body = {}
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        req.session = await TestHelper.unlockSession(user)
        const res2 = TestHelper.createResponse()
        res2.end = async (str) => {
          const doc = TestHelper.extractDoc(str)
          const messageContainer = doc.getElementById('message-container')
          assert.notEqual(null, messageContainer)
          assert.notEqual(null, messageContainer.child)
          const message = messageContainer.child[0]
          assert.equal('success', message.attr.template)
        }
        return req.route.api.get(req, res2)
      }
      return req.route.api.post(req, res)
    })
  })
})
