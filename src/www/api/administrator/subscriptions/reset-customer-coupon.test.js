/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper')

describe(`/api/administrator/subscriptions/delete-customer-discount`, () => {
  describe('DeleteCustomerDiscount#DELETE', () => {
    it('should reject invalid customerid', async () => {
      const administrator = await TestHelper.createAdministrator()
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/delete-customer-discount?customerid=invalid`, 'DELETE')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
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
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
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
      await TestHelper.createCoupon(administrator, {published: true, percent_off: 25, duration: 'repeating', duration_in_months: 3})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCustomerDiscount(user, administrator.coupon.id)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/delete-customer-discount?customerid=${user.customer.id}`, 'DELETE')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      await req.route.api.delete(req)
      req.session = await TestHelper.unlockSession(administrator)
      await req.route.api.delete(req)
      assert.equal(req.success, true)
    })
  })
})
