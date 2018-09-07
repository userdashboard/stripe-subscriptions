/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/user/subscriptions/card-subscriptions', () => {
  describe('CardSubscriptions#GET', () => {
    it('should limit subscriptions on card to one page', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan1 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 10000})
      const plan2 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 20000})
      const plan3 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 30000})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      const subscription1 = await TestHelper.createSubscription(user, plan1.id)
      await TestHelper.waitForNextItem(`card:subscriptions:${user.card.id}`, null)
      const subscription2 = await TestHelper.createSubscription(user, plan2.id)
      await TestHelper.waitForNextItem(`card:subscriptions:${user.card.id}`, subscription1.id)
      const subscription3 = await TestHelper.createSubscription(user, plan3.id)
      await TestHelper.waitForNextItem(`card:subscriptions:${user.card.id}`, subscription2.id)
      const req = TestHelper.createRequest(`/api/user/subscriptions/card-subscriptions?cardid=${user.card.id}`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const subscriptions = await req.route.api.get(req)
      assert.equal(subscriptions.length, 2)
      assert.equal(subscriptions[0].id, subscription3.id)
      assert.equal(subscriptions[1].id, subscription2.id)
    })
  })
})
