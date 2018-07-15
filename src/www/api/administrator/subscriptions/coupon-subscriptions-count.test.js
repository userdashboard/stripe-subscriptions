/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/administrator/subscriptions/coupon-subscriptions-count', async () => {
  describe('CouponSubscriptionsCount#GET', () => {
    it('should count all subscriptions on coupon', async () => {
      const administrator = await TestHelper.createAdministrator()
      const coupon = await TestHelper.createCoupon(administrator, {published: true, percent_off: 10})
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 1000})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, administrator.plan.id)
      await TestHelper.waitForNextItem(`subscription:invoices:${user.subscription.id}`, null)
      await TestHelper.createSubscriptionDiscount(administrator, user.subscription, coupon)
      const user2 = await TestHelper.createUser()
      await TestHelper.createCustomer(user2)
      await TestHelper.createCard(user2)
      await TestHelper.createSubscription(user2, administrator.plan.id)
      await TestHelper.createSubscriptionDiscount(administrator, user2.subscription, coupon)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/coupon-subscriptions-count?couponid=${coupon.id}`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      const result = await req.route.api.get(req)
      assert.equal(result, 2)
    })
  })
})
