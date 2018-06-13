/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/administrator/subscriptions/plan-customers', () => {
  describe('PlanCustomers#GET', () => {
    it('should return list of customers on plan', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true})
      const plan1 = administrator.plan
      await TestHelper.createPlan(administrator, {published: true})
      const plan2 = administrator.plan
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, plan1.id)
      const subscription1 = user.subscription
      await TestHelper.createSubscription(user, plan2.id)
      const subscription2 = user.subscription
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/plan-customers?planid=${user.plan.id}`, 'GET')
      req.account = administrator.account
      req.session = administrator.session
      req.plan = administrator.plan
      const subscriptions = await req.route.api.get(req)
      assert.equal(subscriptions.length >= 2, true)
      assert.equal(subscriptions[0].amount, plan2.amount)
      assert.equal(subscriptions[0].subscription, subscription2.id)
      assert.equal(subscriptions[1].amount, plan1.amount)
      assert.equal(subscriptions[1].subscription, subscription1.id)
    })
  })
})
