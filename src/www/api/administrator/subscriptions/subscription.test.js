/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/administrator/subscriptions/subscription', () => {
  describe('Subscription#GET', () => {
    it('should reject invalid subscriptionid', async () => {
      const administrator = await TestHelper.createAdministrator()
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/subscription?subscriptionid=invalid`, 'GET')
      req.account = administrator.account
      req.session = administrator.session
      try {
        await req.route.api.get(req)
      } catch (error) {
        assert.equal(error.message, 'invalid-subscriptionid')
      }
    })

    it('should return subscription data', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true})
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, administrator.plan.id)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/subscription?subscriptionid=${user.subscription.id}`, 'GET')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
      const subscription = await req.route.api.get(req)
      assert.equal(subscription.id, user.subscription.id)
    })
  })
})
