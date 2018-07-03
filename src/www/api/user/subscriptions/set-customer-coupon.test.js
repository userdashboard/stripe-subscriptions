/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe(`/api/user/subscriptions/set-customer-coupon`, () => {
  describe('SetCustomerCoupon#PATCH', () => {
    it('should reject invalid customerid', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createCoupon(administrator, {published: true})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      const req = TestHelper.createRequest(`/api/user/subscriptions/set-customer-coupon?customerid=invalid`, 'PATCH')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      req.body = {
        couponid: administrator.coupon.id
      }
      let errorMessage
      try {
        await req.route.api.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-account')
    })

    it('should reject account with coupon', async () => {
      const administrator = await TestHelper.createAdministrator()
      const coupon1 = await TestHelper.createCoupon(administrator, {published: true, percent_off: 25})
      const coupon2 = await TestHelper.createCoupon(administrator, {published: true, percent_off: 25})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      user.customer = await TestHelper.createCustomerDiscount(administrator, user.customer, coupon1)
      const req = TestHelper.createRequest(`/api/user/subscriptions/set-customer-coupon?customerid=${user.customer.id}`, 'PATCH')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      req.body = {
        couponid: coupon2.id
      }
      let errorMessage
      try {
        await req.route.api.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-account')
    })

    it('should apply coupon', async () => {
      const administrator = await TestHelper.createAdministrator()
      const coupon = await TestHelper.createCoupon(administrator, {published: true})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      const req = TestHelper.createRequest(`/api/user/subscriptions/set-customer-coupon?customerid=${user.customer.id}`, 'PATCH')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      req.body = {
        couponid: coupon.id
      }
      await req.route.api.patch(req)
      req.session = await TestHelper.unlockSession(user)
      await req.route.api.patch(req)
      assert.equal(req.success, true)
    })
  })
})
