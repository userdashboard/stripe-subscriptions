/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/administrator/subscriptions/subscription-refunds', () => {
  describe('SubscriptionRefunds#GET', () => {
    it('should limit refunds on subscription to one page', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan1 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 1000, interval: 'day'})
      const plan2 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 2000, interval: 'week'})
      const plan3 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 3000, interval: 'month'})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, plan1.id)
      const chargeid1 = await TestHelper.waitForNextItem(`subscription:charges:${user.subscription.id}`, null)
      await TestHelper.createRefund(administrator, chargeid1)
      const refundid1 = await TestHelper.waitForNextItem(`subscription:refunds:${user.subscription.id}`, null)
      await TestHelper.changeSubscription(user, plan2.id)
      const chargeid2 = await TestHelper.waitForNextItem(`subscription:charges:${user.subscription.id}`, chargeid1)
      await TestHelper.createRefund(administrator, chargeid2)
      const refundid2 = await TestHelper.waitForNextItem(`subscription:refunds:${user.subscription.id}`, refundid1)
      await TestHelper.changeSubscription(user, plan3.id)
      const chargeid3 = await TestHelper.waitForNextItem(`subscription:charges:${user.subscription.id}`, chargeid2)
      await TestHelper.createRefund(administrator, chargeid3)
      const refundid3 = await TestHelper.waitForNextItem(`subscription:refunds:${user.subscription.id}`, refundid2)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/subscription-refunds?subscriptionid=${user.subscription.id}`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      const refunds = await req.route.api.get(req)
      assert.equal(refunds.length, 2)
      assert.equal(refunds[0].id, refundid3)
      assert.equal(refunds[1].id, refundid2)
    })
  })
})
