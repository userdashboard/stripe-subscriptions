/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/user/subscriptions/invoice', () => {
  describe('Invoice#GET', () => {
    it('should reject invalid invoice', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/subscriptions/invoice?invoiceid=invalid`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      try {
        await req.route.api.get(req)
      } catch (error) {
        assert.equal(error.message, 'invalid-invoiceid')
      }
    })

    it('should reject other account\'s invoice', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true})
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, administrator.plan.id)
      const user2 = await TestHelper.createUser()
      await TestHelper.createSubscription(user2, administrator.plan.id)
      const req = TestHelper.createRequest(`/api/user/subscriptions/invoice?invoiceid=${user.invoice.id}`, 'GET')
      req.account = user2.account
      req.session = user2.session
      req.customer = user2.customer
      try {
        await req.route.api.get(req)
      } catch (error) {
        assert.equal(error.message, 'invalid-account')
      }
    })

    it('should return invoice data', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true})
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, administrator.plan.id)
      const req = TestHelper.createRequest(`/api/user/subscriptions/invoice?invoiceid=${user.invoice.id}`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const invoice = await req.route.api.get(req)
      assert.equal(invoice.id, user.invoice.id)
    })
  })
})
