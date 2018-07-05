/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/administrator/subscriptions/coupon-customers', () => {
  describe('CouponCustomers#GET', () => {
    it('should limit customers on coupon to one page', async () => {
      const administrator = await TestHelper.createAdministrator()
      const coupon = await TestHelper.createCoupon(administrator, {published: true, amount_off: 25, currency: 'usd'})
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 1000})
      const user1 = await TestHelper.createUser()
      await TestHelper.createCustomer(user1)
      await TestHelper.createCard(user1)
      await TestHelper.createSubscription(user1, plan.id)
      await TestHelper.createCustomerDiscount(administrator, user1.customer, coupon)
      const user2 = await TestHelper.createUser()
      await TestHelper.createCustomer(user2)
      await TestHelper.createCustomerDiscount(administrator, user2.customer, coupon)
      const user3 = await TestHelper.createUser()
      await TestHelper.createCustomer(user3)
      await TestHelper.createCustomerDiscount(administrator, user3.customer, coupon)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/coupon-customers?couponid=${coupon.id}`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      const customers = await req.route.api.get(req)
      assert.equal(customers.length, 2)
      assert.equal(customers[0].id, user3.customer.id)
      assert.equal(customers[1].id, user2.customer.id)
    })
  })
})
