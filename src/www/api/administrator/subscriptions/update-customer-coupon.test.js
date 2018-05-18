/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe(`/api/administrator/subscriptions/update-customer-coupon`, () => {
  describe('UpdateCustomerCoupon#PATCH', () => {
    it('should reject invalid customerid', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createCoupon(administrator, { published: true })
      const newCoupon = administrator.coupon
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/update-customer-coupon?customerid=invalid`, 'PATCH')
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        couponid: newCoupon.id
      }
      try {
        await req.route.api.patch(req)
      } catch (error) {
        assert.equal(error.message, 'invalid-customerid')
      }
    })

    it('should reject invalid couponid', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createCoupon(administrator, { published: true })
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/update-customer-coupon?customerid=${user.customer.id}`, 'PATCH')
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        couponid: 'invalid'
      }
      try {
        await req.route.api.patch(req)
      } catch (error) {
        assert.equal(error.message, 'invalid-couponid')
      }
    })

    it('should reject unpublished coupon', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createCoupon(administrator, { published: true, unpublished: true })
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      const newCoupon = administrator.coupon
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/update-customer-coupon?customerid=${user.customer.id}`, 'PATCH')
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        couponid: newCoupon.id
      }
      try {
        await req.route.api.patch(req)
      } catch (error) {
        assert.equal(error.message, 'invalid-coupon')
      }
    })

    it('should update customer coupon', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createCoupon(administrator, { published: true })
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      const newCoupon = administrator.coupon
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/update-customer-coupon?customerid=${user.customer.id}`, 'PATCH')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
      req.body = {
        couponid: newCoupon.id
      }
      await req.route.api.patch(req)
      await TestHelper.completeAuthorization(req)
      await req.route.api.patch(req)
      req.route.api.patch(req)
    })
  })
})
