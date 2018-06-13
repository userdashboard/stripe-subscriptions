/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe(`/api/administrator/subscriptions/set-invoice-forgiven`, () => {
  describe('SetInvoiceForgiven#PATCH', () => {
    it('should reject invalid invoiceid', async () => {
      const administrator = await TestHelper.createAdministrator()
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/set-invoice-forgiven?invoiceid=invalid`, 'PATCH')
      req.account = administrator.account
      req.session = administrator.session
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
      await TestHelper.createPlan(administrator, { published: true })
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, administrator.plan.id)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/set-invoice-forgiven?invoiceid=${user.invoice.id}`, 'PATCH')
      req.account = administrator.account
      req.session = administrator.session
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
      await req.route.api.patch(req)
      await TestHelper.completeAuthorization(req)
      await req.route.api.patch(req)
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
      await TestHelper.createPlan(administrator, { published: true })
      const plan1 = await TestHelper.createPlan(administrator, { published: true }, {}, 10000, 0)
      const plan2 = await TestHelper.createPlan(administrator, { published: true }, {}, 20000, 0)
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, plan1.id)
      await TestHelper.changeSubscription(user, plan2.id)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/set-invoice-forgiven?invoiceid=${user.invoice.id}`, 'PATCH')
      req.account = administrator.account
      req.session = administrator.session
      await req.route.api.patch(req)
      await TestHelper.completeAuthorization(req)
      await req.route.api.patch(req)
      assert.equal(req.success, true)
    })
  })
})
