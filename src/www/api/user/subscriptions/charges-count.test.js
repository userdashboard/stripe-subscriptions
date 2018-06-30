/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/user/subscriptions/charges-count', async () => {
  describe('Charges#GET', () => {
    it('should count charges', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan1 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 10000})
      const plan2 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 20000})
      const plan3 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 30000})
      const plan4 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 40000})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, plan1.id)
      await TestHelper.waitForWebhooks(2)
      await TestHelper.changeSubscription(user, plan2.id)
      await TestHelper.waitForWebhooks(4)
      await TestHelper.createSubscription(user, plan3.id)
      await TestHelper.waitForWebhooks(6)
      await TestHelper.changeSubscription(user, plan4.id)
      await TestHelper.waitForWebhooks(8)
      const req = TestHelper.createRequest(`/api/user/subscriptions/charges-count?customerid=${user.customer.id}`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const result = await req.route.api.get(req)
      assert.equal(result, 4)
    })
  })
})
