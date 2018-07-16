/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/user/subscriptions/subscription-invoices-count', async () => {
  describe('SubscriptionInvoicesCount#GET', () => {
    it('should count subscription\'s invoices', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan1 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 10000, interval: 'day'})
      const plan2 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 20000, interval: 'week'})
      const plan3 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 30000, interval: 'month'})
      const plan4 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 40000, interval: 'year'})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, plan4.id)
      const invoiceid1 = await TestHelper.waitForNextItem(`subscription:invoices:${user.subscription.id}`, null)
      await TestHelper.changeSubscription(user, plan3.id)
      const invoiceid2 = await TestHelper.waitForNextItem(`subscription:invoices:${user.subscription.id}`, invoiceid1)
      await TestHelper.changeSubscription(user, plan2.id)
      const invoiceid3 = await TestHelper.waitForNextItem(`subscription:invoices:${user.subscription.id}`, invoiceid2)
      await TestHelper.changeSubscription(user, plan1.id)
      await TestHelper.waitForNextItem(`subscription:invoices:${user.subscription.id}`, invoiceid3)
      const req = TestHelper.createRequest(`/api/user/subscriptions/subscription-invoices-count?subscriptionid=${user.subscription.id}`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const result = await req.route.api.get(req)
      assert.equal(result, 4)
    })
  })
})
