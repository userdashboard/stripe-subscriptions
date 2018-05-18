/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../test-helper.js')

describe(`/account/subscriptions/refund-invoice`, async () => {
  describe('RefundInvoice#BEFORE', () => {
    it('should reject invalid invoice', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user, false)
      const req = TestHelper.createRequest('/account/subscriptions/refund-invoice?invoiceid=invalid', 'POST')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      try {
        await req.route.api.before(req)
      } catch (error) {
        assert.equal(error.message, 'invalid-invoiceid')
      }
    })

    it('should reject other account\'s invoice', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true}, {}, 1000, 0)
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, administrator.plan.id)
      const user2 = await TestHelper.createUser()
      await TestHelper.createCustomer(user2, false)
      const req = TestHelper.createRequest(`/account/subscriptions/refund-invoice?invoiceid=${user.invoice.id}`, 'POST')
      req.account = user2.account
      req.session = user2.session
      req.customer = user2.customer
      try {
        await req.route.api.before(req)
      } catch (error) {
        assert.equal(error.message, 'invalid-account')
      }
    })

    it('should bind invoice to req', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true}, {}, 1000, 0)
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, administrator.plan.id)
      const req = TestHelper.createRequest(`/account/subscriptions/refund-invoice?invoiceid=${user.invoice.id}`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      await req.route.api.before(req)
      assert.notEqual(req.data, null)
      assert.notEqual(req.data.invoice, null)
      assert.equal(req.data.invoice.id, user.invoice.id)
    })

    it('should bind charge to req', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true}, {}, 1000, 0)
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, administrator.plan.id)
      const req = TestHelper.createRequest(`/account/subscriptions/refund-invoice?invoiceid=${user.invoice.id}`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      await req.route.api.before(req)
      assert.notEqual(req.data, null)
      assert.notEqual(req.data.charge, null)
      assert.equal(req.data.charge.id, user.charge.id)
    })
  })

  describe('RefundInvoice#GET', () => {
    it('should present the form', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true}, {}, 1000, 0)
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, administrator.plan.id)
      const req = TestHelper.createRequest(`/account/subscriptions/refund-invoice?invoiceid=${user.invoice.id}`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        assert.notEqual(null, doc)
        assert.notEqual(null, doc.getElementById('submitForm'))
        assert.notEqual(null, doc.getElementById('submitButton'))
      }
      return req.route.api.get(req, res)
    })
  })

  describe('RefundInvoice#PATCH', () => {
    it('should apply after authorization', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true}, {}, 1000, 0)
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, administrator.plan.id)
      const req = TestHelper.createRequest(`/account/subscriptions/refund-invoice?invoiceid=${user.invoice.id}`, 'POST')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      req.body = {}
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        await TestHelper.completeAuthorization(req)
        const res2 = TestHelper.createResponse()
        res2.end = async (str) => {
          const doc = TestHelper.extractDoc(str)
          const messageContainer = doc.getElementById('messageContainer')
          assert.notEqual(null, messageContainer)
          assert.notEqual(null, messageContainer.child)
          const message = messageContainer.child[0]
          assert.equal('success', message.attr.error)
        }
        return req.route.api.get(req, res2)
      }
      return req.route.api.post(req, res)
    })
  })
})
