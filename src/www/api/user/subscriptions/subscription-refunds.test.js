/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/user/subscriptions/subscription-refunds', () => {
  describe('SubscriptionRefunds#GET', () => {
    it('should limit refunds on subscription to one page', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan1 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 1000})
      const plan2 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 2000})
      const plan3 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 3000})
      const plan4 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 4000})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, plan4.id)
      const chargeid1 = await TestHelper.waitForNextItem(`subscription:charges:${user.subscription.id}`, null)
      await TestHelper.changeSubscription(user, plan3.id)
      const chargeid2 = await TestHelper.waitForNextItem(`subscription:charges:${user.subscription.id}`, chargeid1)
      await TestHelper.createRefund(administrator, chargeid2)
      const refundid1 = await TestHelper.waitForNextItem(`subscription:refunds:${user.subscription.id}`, null)
      await TestHelper.changeSubscription(user, plan2.id)
      const chargeid3 = await TestHelper.waitForNextItem(`subscription:charges:${user.subscription.id}`, chargeid2)
      await TestHelper.createRefund(administrator, chargeid3)
      const refundid2 = await TestHelper.waitForNextItem(`subscription:refunds:${user.subscription.id}`, refundid1)
      await TestHelper.changeSubscription(user, plan1.id)
      const chargeid4 = await TestHelper.waitForNextItem(`subscription:charges:${user.subscription.id}`, chargeid3)
       await TestHelper.createRefund(administrator, chargeid4)
      const refundid3 = await TestHelper.waitForNextItem(`subscription:refunds:${user.subscription.id}`, refundid2)
      const req = TestHelper.createRequest(`/api/user/subscriptions/subscription-refunds?subscriptionid=${user.subscription.id}`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const refunds = await req.route.api.get(req)
      assert.equal(refunds.length, 2)
      assert.equal(refunds[0].id, refundid3)
      assert.equal(refunds[1].id, refundid2)
    })
  })
})
