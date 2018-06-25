/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/user/subscriptions/subscriptions', () => {
  describe('Subscriptions#GET', () => {
    it('should return subscription list', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan1 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 1000})
      const plan2 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 2000})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, plan1.id)
      const subscription1 = user.subscription
      await TestHelper.createSubscription(user, plan2.id)
      const subscription2 = user.subscription
      const req = TestHelper.createRequest(`/api/user/subscriptions/subscriptions`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const subscriptions = await req.route.api.get(req)
      assert.equal(subscriptions.length, 2)
      assert.equal(subscriptions[0].id, subscription2.id)
      assert.equal(subscriptions[1].id, subscription1.id)
    })
  })
})
