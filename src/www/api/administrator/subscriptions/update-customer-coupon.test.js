/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe(`/api/administrator/subscriptions/update-customer-coupon`, () => {
  describe('UpdateCustomerCoupon#PATCH', () => {
    it('should reject invalid customerid', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createCoupon(administrator, {published: true, percent_off: 25, duration: 'repeating', duration_in_months: 3})
      const newCoupon = administrator.coupon
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/update-customer-coupon?customerid=invalid`, 'PATCH')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      req.body = {
        couponid: newCoupon.id
      }
      let errorMessage
      try {
        await req.route.api.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-customerid')
    })

    it('should reject invalid couponid', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createCoupon(administrator, {published: true, percent_off: 25, duration: 'repeating', duration_in_months: 3})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/update-customer-coupon?customerid=${user.customer.id}`, 'PATCH')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      req.body = {
        couponid: 'invalid'
      }
      let errorMessage
      try {
        await req.route.api.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-couponid')
    })

    it('should reject unpublished coupon', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createCoupon(administrator, {published: true, percent_off: 25, duration: 'repeating', duration_in_months: 3})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      const newCoupon = administrator.coupon
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/update-customer-coupon?customerid=${user.customer.id}`, 'PATCH')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      req.body = {
        couponid: newCoupon.id
      }
      let errorMessage
      try {
        await req.route.api.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-coupon')
    })

    it('should update customer coupon', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createCoupon(administrator, {published: true, percent_off: 25, duration: 'repeating', duration_in_months: 3})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      const newCoupon = administrator.coupon
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/update-customer-coupon?customerid=${user.customer.id}`, 'PATCH')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      req.body = {
        couponid: newCoupon.id
      }
      await req.route.api.patch(req)
      req.session = await TestHelper.unlockSession(administrator)
      await req.route.api.patch(req)
      req.route.api.patch(req)
    })
  })
})
