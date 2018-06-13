/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/administrator/subscriptions/subscription-charges', () => {
  describe('SubscriptionCharges#GET', () => {
    it('should return list of charges on subscription', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true})
      const product1 = administrator.product
      await TestHelper.createPlan(administrator, {published: true})
      const product2 = administrator.product
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, product1.id)
      const subscription1 = user.subscription
      await TestHelper.createSubscription(user, product2.id)
      const subscription2 = user.subscription
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/subscription-charges?subscriptionid=${user.subscription.id}`, 'GET')
      req.account = administrator.account
      req.session = administrator.session
      req.product = administrator.product
      const subscriptions = await req.route.api.get(req)
      assert.equal(subscriptions.length >= 2, true)
      assert.equal(subscriptions[0].amount, product2.amount)
      assert.equal(subscriptions[0].subscription, subscription2.id)
      assert.equal(subscriptions[1].amount, product1.amount)
      assert.equal(subscriptions[1].subscription, subscription1.id)
    })
  })
})
