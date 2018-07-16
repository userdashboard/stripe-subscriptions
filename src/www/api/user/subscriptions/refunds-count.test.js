/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/user/subscriptions/refunds-count', async () => {
  describe('RefundsCount#GET', () => {
    it('should count refunds', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan1 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 1000, trial_period_days: 0})
      const plan2 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 1000, trial_period_days: 0, interval: 'day'})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, plan1.id)
      const invoiceid1 = await TestHelper.waitForNextItem(`subscription:invoices:${user.subscription.id}`, null)
      const chargeid1 = await TestHelper.waitForNextItem(`subscription:charges:${user.subscription.id}`, null)
      await TestHelper.changeSubscription(user, plan2.id)
      const invoiceid2 = await TestHelper.waitForNextItem(`subscription:invoices:${user.subscription.id}`, invoice1)
      const chargeid2 = await TestHelper.waitForNextItem(`subscription:charges:${user.subscription.id}`, chargeid1)
      await TestHelper.createRefund(administrator, chargeid2)
      const refundid1 = await TestHelper.waitForNextItem(`subscription:refunds:${user.subscription.id}`, null)
      await TestHelper.createSubscription(user, plan1.id)
      const invoiceid3 = await TestHelper.waitForNextItem(`subscription:invoices:${user.subscription.id}`, invoice2)
      const chargeid3 = await TestHelper.waitForNextItem(`subscription:charges:${user.subscription.id}`, null)
      await TestHelper.changeSubscription(user, plan2.id)
      const invoiceid4 = await TestHelper.waitForNextItem(`subscription:invoices:${user.subscription.id}`, invoice3)
      const chargeid4 = await TestHelper.waitForNextItem(`subscription:charges:${user.subscription.id}`, chargeid3)
      await TestHelper.createRefund(administrator, chargeid4)
      await TestHelper.waitForNextItem(`subscription:refunds:${user.subscription.id}`, refundid1)
      const req = TestHelper.createRequest(`/api/user/subscriptions/refunds-count?customerid=${user.customer.id}`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const result = await req.route.api.get(req)
      assert.equal(result, 2)
    })
  })
})
