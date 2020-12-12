/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper')

describe('/api/administrator/subscriptions/reset-customer-coupon', function () {
  describe('exceptions', () => {
    describe('invalid-customerid', () => {
      it('missing querystring customerid', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/subscriptions/reset-customer-coupon')
        req.account = administrator.account
        req.session = administrator.session
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-customerid')
      })

      it('invalid querystring customerid', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/subscriptions/reset-customer-coupon?customerid=invalid')
        req.account = administrator.account
        req.session = administrator.session
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-customerid')
      })
    })

    describe('invalid-customeir', () => {
      it('invalid querystring customer has no discount', async () => {
        const administrator = await TestHelper.createOwner()
        const user = await TestHelper.createUser()
        await TestHelper.createCustomer(user, {
          email: user.profile.contactEmail,
          description: user.profile.firstName
        })
        const req = TestHelper.createRequest(`/api/administrator/subscriptions/reset-customer-coupon?customerid=${user.customer.id}`)
        req.account = administrator.account
        req.session = administrator.session
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-customer')
      })
    })
  })

  describe('receives', () => {
    it('object', async () => {
      const administrator = await TestHelper.createOwner()
      await TestHelper.createCoupon(administrator, {
        published: 'true',
        percent_off: '25',
        duration: 'repeating',
        duration_in_months: '3'
      })
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user, {
        email: user.profile.contactEmail,
        description: user.profile.firstName
      })
      await TestHelper.createCustomerDiscount(administrator, user.customer, administrator.coupon)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/reset-customer-coupon?customerid=${user.customer.id}`)
      req.account = administrator.account
      req.session = administrator.session
      const customerNow = await req.patch()
      assert.strictEqual(undefined, customerNow.coupon)
    })
  })
})
