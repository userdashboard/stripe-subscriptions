/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/user/subscriptions/upcoming-invoice', () => {
  describe('Invoice#GET', () => {
    it('should reject invalid subscriptionid', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/subscriptions/upcoming-invoice?subscriptionid=invalid`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      try {
        await req.route.api.get(req)
      } catch (error) {
        assert.equal(error.message, 'invalid-subscriptionid')
      }
    })

    it('should reject other account\'s subscription', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true})
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, administrator.plan.id)
      const user2 = await TestHelper.createUser()
      await TestHelper.createSubscription(user2, administrator.plan.id)
      const req = TestHelper.createRequest(`/api/user/subscriptions/upcoming-invoice?subscriptionid=${user.subscription.id}`, 'GET')
      req.account = user2.account
      req.session = user2.session
      req.customer = user2.customer
      try {
        await req.route.api.get(req)
      } catch (error) {
        assert.equal(error.message, 'invalid-subscriptionid')
      }
    })

    it('should return upcoming invoice for subscription', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true})
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, administrator.plan.id)
      const req = TestHelper.createRequest(`/api/user/subscriptions/upcoming-invoice?subscriptionid=${user.subscription.id}`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const invoice = await req.route.api.get(req)
      assert.equal(invoice.total, administrator.plan.amount)
    })
  })
})
