/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../test-helper.js')

describe('/account/subscriptions/invoice', () => {
  describe('Invoice#BEFORE', () => {
    it('should reject invalid invoice', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user, false)
      const req = TestHelper.createRequest('/account/subscriptions/invoice?invoiceid=invalid', 'POST')
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
      const req = TestHelper.createRequest(`/account/subscriptions/invoice?invoiceid=${user.invoice.id}`, 'POST')
      req.account = user2.account
      req.session = user2.session
      req.customer = user2.customer
      try {
        await req.route.api.before(req)
      } catch (error) {
        assert.equal(error.message, 'invalid-account')
      }
    })
    it('should reject invalid invoice', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user, false)
      const req = TestHelper.createRequest('/account/subscriptions/invoice?invoiceid=invalid', 'POST')
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
      const req = TestHelper.createRequest(`/account/subscriptions/invoice?invoiceid=${user.invoice.id}`, 'POST')
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
    it('should present the invoice table', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true}, {}, 1000, 0)
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, administrator.plan.id)
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
