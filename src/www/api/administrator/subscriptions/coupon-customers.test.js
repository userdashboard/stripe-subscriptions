/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/administrator/subscriptions/coupon-customers', () => {
  describe('CouponCustomers#GET', () => {
    it.only('should limit customers on coupon to one page', async () => {
      const administrator = await TestHelper.createAdministrator()
      const coupon = await TestHelper.createProduct(administrator, {published: true, amount_off: 25})
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 1000})
      const user1 = await TestHelper.createUser()
      await TestHelper.createCustomer(user1)
      await TestHelper.createCustomerDiscount(administrator, user1.customer, coupon)
      const user2 = await TestHelper.createUser()
      await TestHelper.createCustomer(user2)
      await TestHelper.createCustomerDiscount(administrator, user2.customer, coupon)
      const user3 = await TestHelper.createUser()
      await TestHelper.createCustomer(user3)
      await TestHelper.createCard(user3)
      await TestHelper.createSubscription(user3, plan.id)
      await TestHelper.waitForWebhooks(2)
      await TestHelper.createSubscriptionDiscount(administrator, user3.subscription, coupon)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/coupon-customers?couponid=${coupon.id}`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      const subscriptions = await req.route.api.get(req)
      assert.equal(subscriptions.length, global.PAGE_SIZE)
      assert.equal(subscriptions[0].id, user3.customer.id)
      assert.equal(subscriptions[1].id, user2.customer.id)
    })
  })
})
