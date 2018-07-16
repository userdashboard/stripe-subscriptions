/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/administrator/subscriptions/subscription-invoices', () => {
  describe('SubscriptionInvoices#GET', () => {
    it('should limit invoices on subscription to one page', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan1 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 1000, interval: 'day'})
      const plan2 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 2000, interval: 'week'})
      const plan3 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 3000, interval: 'month'})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, plan1.id)
      const invoiceid1 = await TestHelper.waitForNextItem(`subscription:invoices:${user.subscription.id}`, null)
      await TestHelper.changeSubscription(user, plan2.id)
      const invoiceid2 = await TestHelper.waitForNextItem(`subscription:invoices:${user.subscription.id}`, invoiceid1)
      await TestHelper.changeSubscription(user, plan3.id)
      const invoiceid3 = await TestHelper.waitForNextItem(`subscription:invoices:${user.subscription.id}`, invoiceid2)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/subscription-invoices?subscriptionid=${user.subscription.id}`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      const invoices = await req.route.api.get(req)
      assert.equal(invoices.length, 2)
      assert.equal(invoices[0].id, invoiceid3)
      assert.equal(invoices[1].id, invoiceid2)
    })
  })
})
