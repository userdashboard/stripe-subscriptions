/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/administrator/subscriptions/subscription-charges-count', async () => {
  describe('SubscriptionChargesCount#GET', () => {
    it('should count all charges on subscription', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan1 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 1000})
      const plan2 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 2000, interval: 'day'})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, plan1.id)
      const invoiceid1 = await TestHelper.waitForNextItem(`subscription:invoices:${user.subscription.id}`, null)
      const chargeid1 = await TestHelper.waitForNextItem(`subscription:charges:${user.subscription.id}`, null)
      await TestHelper.changeSubscription(user, plan2.id)
      await TestHelper.waitForNextItem(`subscription:invoices:${user.subscription.id}`, invoiceid1)
      await TestHelper.waitForNextItem(`subscription:charges:${user.subscription.id}`, chargeid1)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/subscription-charges-count?subscriptionid=${user.subscription.id}`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      const result = await req.route.api.get(req)
      assert.equal(result, 2)
    })
  })
})
