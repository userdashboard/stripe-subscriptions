/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/administrator/subscriptions/coupon-customers-count', async () => {
  describe('CouponCustomersCount#GET', () => {
    it('should count all customers on coupon', async () => {
      const administrator = await TestHelper.createAdministrator()
      const coupon = await TestHelper.createCoupon(administrator, {published: true, percent_off: 10})
      const user1 = await TestHelper.createUser()
      await TestHelper.createCustomer(user1)
      await TestHelper.createCustomerDiscount(administrator, user1.customer, coupon)
      const user2 = await TestHelper.createUser()
      await TestHelper.createCustomer(user2)
      await TestHelper.createCustomerDiscount(administrator, user2.customer, coupon)
      const user3 = await TestHelper.createUser()
      await TestHelper.createCustomer(user3)
      await TestHelper.createCustomerDiscount(administrator, user3.customer, coupon)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/coupon-customers-count?couponid=${coupon.id}`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      const result = await req.route.api.get(req)
      assert.equal(result, 3)
    })
  })
})
