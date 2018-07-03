/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/user/subscriptions/refunds-count', async () => {
  describe('RefundsCount#GET', () => {
    it('should count refunds', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan1 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 1000, trial_period_days: 0})
      const plan2 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 1000, trial_period_days: 0})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, plan1.id)
      await TestHelper.waitForWebhooks(2)
      await TestHelper.changeSubscription(user, plan2.id)
      await TestHelper.waitForWebhooks(4)
      await TestHelper.createRefund(user, user.charge)
      await TestHelper.waitForWebhooks(5)
      await TestHelper.createSubscription(user, plan1.id)
      await TestHelper.waitForWebhooks(7)
      await TestHelper.changeSubscription(user, plan2.id)
      await TestHelper.waitForWebhooks(9)
      await TestHelper.createRefund(user, user.charge)
      await TestHelper.waitForWebhooks(10)
      const req = TestHelper.createRequest(`/api/user/subscriptions/refunds-count?customerid=${user.customer.id}`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const result = await req.route.api.get(req)
      assert.equal(result, 2)
    })
  })
})
