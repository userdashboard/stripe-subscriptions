/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/user/subscriptions/disputes', () => {
  describe('disputes#GET', () => {
    it('should limit disputes to one page', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan1 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 1000, trial_period_days: 0})
      const plan2 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 1000, trial_period_days: 0})
      const plan3 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 1000, trial_period_days: 0})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, plan1.id)
      await TestHelper.waitForWebhooks(2)
      const subscription2 = await TestHelper.createSubscription(user, plan2.id)
      await TestHelper.waitForWebhooks(4)
      const subscription3 = await TestHelper.createSubscription(user, plan3.id)
      await TestHelper.waitForWebhooks(6)
      const req = TestHelper.createRequest(`/api/user/subscriptions/disputes?customerid=${user.customer.id}`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const disputes = await req.route.api.get(req)
      assert.equal(disputes.length, 2)
      assert.equal(disputes[0].subscription, subscription3.id)
      assert.equal(disputes[1].subscription, subscription2.id)
    })
  })
})
