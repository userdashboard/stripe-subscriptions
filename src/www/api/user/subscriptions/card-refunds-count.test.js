/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/user/subscriptions/card-refunds-count', async () => {
  describe('CardRefundsCount#GET', () => {
    it('should count all refunds on card', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 10000})
      const plan2 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 20000})
      const plan3 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 30000})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, plan2.id)
      const chargeid1 = await TestHelper.waitForNextItem(`subscription:charges:${user.subscription.id}`, null)
      await TestHelper.createRefund(administrator, chargeid1)
      await TestHelper.waitForNextItem(`subscription:refunds:${user.subscription.id}`, null)
      await TestHelper.createSubscription(user, plan2.id)
      const chargeid2 = await TestHelper.waitForNextItem(`subscription:charges:${user.subscription.id}`, null)
      await TestHelper.createRefund(administrator, chargeid2)
      await TestHelper.waitForNextItem(`subscription:refunds:${user.subscription.id}`, null)
      await TestHelper.createSubscription(user, plan3.id)
      const chargeid3 = await TestHelper.waitForNextItem(`subscription:charges:${user.subscription.id}`, null)
      await TestHelper.createRefund(administrator, chargeid3)
      await TestHelper.waitForNextItem(`subscription:refunds:${user.subscription.id}`, null)
      const req = TestHelper.createRequest(`/api/user/subscriptions/card-refunds-count?cardid=${user.card.id}`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const result = await req.route.api.get(req)
      assert.equal(result, 3)
    })
  })
})
