/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe(`/api/user/subscriptions/set-invoice-paid`, () => {
  describe('SetInvoicePaid#PATCH', () => {
    it('should reject invalid invoiceid', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user, true)
      const req = TestHelper.createRequest(`/api/user/subscriptions/set-invoice-paid?invoiceid=invalid`, 'PATCH')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      req.body = {
        sourceid: user.customer.default_source
      }
      let errorMessage
      try {
        await req.route.api.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-invoiceid')
    })

    it('should reject other account\'s invoice', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true})
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, administrator.plan.id)
      const user2 = await TestHelper.createUser()
      await TestHelper.createSubscription(user2, administrator.plan.id)
      const req = TestHelper.createRequest(`/api/user/subscriptions/set-invoice-paid?invoiceid=${user.invoice.id}`, 'GET')
      req.account = user2.account
      req.session = user2.session
      req.customer = user2.customer
      req.body = {
        sourceid: user2.customer.default_source
      }
      let errorMessage
      try {
        await req.route.api.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-account')
    })

    it('should reject paid invoice', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, { published: true })
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, administrator.plan.id)
      const req = TestHelper.createRequest(`/api/user/subscriptions/set-invoice-paid?invoiceid=${user.invoice.id}`, 'PATCH')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      req.body = {
        sourceid: user.customer.default_source
      }
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
      const plan1 = await TestHelper.createPlan(administrator, { published: true }, {}, 10000, 0)
      const plan2 = await TestHelper.createPlan(administrator, { published: true }, {}, 20000, 0)
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, plan1.id)
      await TestHelper.changeSubscription(user, plan2.id)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/set-invoice-forgiven?invoiceid=${user.invoice.id}`, 'PATCH')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = user.customer
      await req.route.api.patch(req)
      await TestHelper.completeAuthorization(req)
      await req.route.api.patch(req)
      const req2 = TestHelper.createRequest(`/api/user/subscriptions/set-invoice-paid?invoiceid=${user.invoice.id}`, 'PATCH')
      req2.account = user.account
      req2.session = user.session
      req2.customer = user.customer
      req2.body = {
        sourceid: user.customer.default_source
      }
      let errorMessage
      try {
        await req2.route.api.patch(req2)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-invoice')
    })

    it('should require valid source', async () => {
      const administrator = await TestHelper.createAdministrator()
      const plan1 = await TestHelper.createPlan(administrator, { published: true }, {}, 10000, 0)
      const plan2 = await TestHelper.createPlan(administrator, { published: true }, {}, 20000, 0)
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, plan1.id)
      await TestHelper.changeSubscription(user, plan2.id)
      const req = TestHelper.createRequest(`/api/user/subscriptions/set-invoice-paid?invoiceid=${user.invoice.id}`, 'PATCH')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      req.body = {
        sourceid: 'invalid'
      }
      await req.route.api.patch(req)
      await TestHelper.completeAuthorization(req)
      let errorMessage
      try {
        await req.route.api.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-sourceid')
    })

    it('should reject other account\'s source', async () => {
      const administrator = await TestHelper.createAdministrator()
      const plan1 = await TestHelper.createPlan(administrator, { published: true }, {}, 10000, 0)
      const plan2 = await TestHelper.createPlan(administrator, { published: true }, {}, 20000, 0)
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user, true)
      const user2 = await TestHelper.createUser()
      await TestHelper.createSubscription(user2, plan1.id)
      await TestHelper.changeSubscription(user2, plan2.id)
      const req = TestHelper.createRequest(`/api/user/subscriptions/set-invoice-paid?invoiceid=${user2.invoice.id}`, 'GET')
      req.account = user2.account
      req.session = user2.session
      req.customer = user2.customer
      req.body = {
        sourceid: user.customer.default_source
      }
      await req.route.api.patch(req)
      await TestHelper.completeAuthorization(req)
      let errorMessage
      try {
        await req.route.api.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-sourceid')
    })

    it('should pay invoice', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, { published: true })
      const plan1 = await TestHelper.createPlan(administrator, { published: true }, {}, 10000, 0)
      const plan2 = await TestHelper.createPlan(administrator, { published: true }, {}, 20000, 0)
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, plan1.id)
      await TestHelper.changeSubscription(user, plan2.id)
      const req = TestHelper.createRequest(`/api/user/subscriptions/set-invoice-paid?invoiceid=${user.invoice.id}`, 'PATCH')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      req.body = {
        sourceid: user.customer.default_source
      }
      await req.route.api.patch(req)
      await TestHelper.completeAuthorization(req)
      await req.route.api.patch(req)
      assert.equal(req.success, true)
    })
  })
})
