/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/user/subscriptions/subscription-invoices-count', async () => {
  describe('SubscriptionInvoicesCount#GET', () => {
    it('should count subscription\'s invoices', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 1000, trial_period_days: 0})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, user.subscription.id)
      await TestHelper.createCard(user)
      const req = TestHelper.createRequest(`/api/user/subscriptions/subscription-invoices-count?subscriptionid=${user.subscription.id}`, 'GET')
      req.account = user.account
      req.session = user.session
      const result = await req.route.api.get(req)
      assert.equal(result, 2)
    })
  })
})
