/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper')

describe(`/api/administrator/subscriptions/delete-customer-discount`, () => {
  describe('DeleteCustomerDiscount#DELETE', () => {
    it('should reject invalid customerid', async () => {
      const administrator = await TestHelper.createAdministrator()
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/delete-customer-discount?customerid=invalid`, 'DELETE')
      req.account = administrator.account
      req.session = administrator.session
      let errorMessage
      try {
        await req.route.api.delete(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-customerid')
    })

    it('should reject undiscounted customer', async () => {
      const administrator = await TestHelper.createAdministrator()
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/delete-customer-discount?customerid=${user.customer.id}`, 'DELETE')
      req.account = administrator.account
      req.session = administrator.session
      let errorMessage
      try {
        await req.route.api.delete(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-customer')
    })

    it('should delete customer discount', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createCoupon(administrator, { published: true })
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCustomerDiscount(user, administrator.coupon.id)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/delete-customer-discount?customerid=${user.customer.id}`, 'DELETE')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
      await req.route.api.delete(req)
      await TestHelper.completeAuthorization(req)
      await req.route.api.delete(req)
      assert.equal(req.success, true)
    })
  })
})
