/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/user/subscriptions/set-customer-coupon', () => {
  describe('exceptions', () => {
    describe('invalid-customerid', () => {
      it('missing querystring customerid', async () => {
        const administrator = await TestHelper.createOwner()
        await TestHelper.createCoupon(administrator, {
          published: 'true'
        })
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/subscriptions/set-customer-coupon')
        req.account = user.account
        req.session = user.session
        req.body = {
          couponid: administrator.coupon.id
        }
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
        await TestHelper.createCoupon(administrator, {
          published: 'true'
        })
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/subscriptions/set-customer-coupon?customerid=invalid')
        req.account = user.account
        req.session = user.session
        req.body = {
          couponid: administrator.coupon.id
        }
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-customerid')
      })
    })

    describe('invalid-customer', () => {
      it('invalid querystring customer has coupon', async () => {
        const administrator = await TestHelper.createOwner()
        const coupon1 = await TestHelper.createCoupon(administrator, {
          published: 'true',
          percent_off: '25'
        })
        const coupon2 = await TestHelper.createCoupon(administrator, {
          published: 'true',
          percent_off: '25'
        })
        const user = await TestHelper.createUser()
        await TestHelper.createCustomer(user, {
          email: user.profile.contactEmail,
          description: user.profile.firstName,
          country: 'US'
        })
        user.customer = await TestHelper.createCustomerDiscount(administrator, user.customer, coupon1)
        const req = TestHelper.createRequest(`/api/user/subscriptions/set-customer-coupon?customerid=${user.customer.id}`)
        req.account = user.account
        req.session = user.session
        req.body = {
          couponid: coupon2.id
        }
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-customer')
      })
    })

    describe('invalid-account', () => {
      it('ineligible account accessing', async () => {
        const administrator = await TestHelper.createOwner()
        const coupon = await TestHelper.createCoupon(administrator, {
          published: 'true',
          percent_off: '25'
        })
        const user = await TestHelper.createUser()
        await TestHelper.createCustomer(user, {
          email: user.profile.contactEmail,
          description: user.profile.firstName,
          country: 'US'
        })
        const user2 = await TestHelper.createUser()
        const req = TestHelper.createRequest(`/api/user/subscriptions/set-customer-coupon?customerid=${user.customer.id}`)
        req.account = user2.account
        req.session = user2.session
        req.body = {
          couponid: coupon.id
        }
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-account')
      })
    })

    describe('invalid-couponid', () => {
      it('missing posted couponid', async () => {
        const user = await TestHelper.createUser()
        await TestHelper.createCustomer(user, {
          email: user.profile.contactEmail,
          description: user.profile.firstName,
          country: 'US'
        })
        const req = TestHelper.createRequest(`/api/user/subscriptions/set-customer-coupon?customerid=${user.customer.id}`)
        req.account = user.account
        req.session = user.session
        req.body = {
          couponid: ''
        }
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-couponid')
      })

      it('invalid posted couponid', async () => {
        const user = await TestHelper.createUser()
        await TestHelper.createCustomer(user, {
          email: user.profile.contactEmail,
          description: user.profile.firstName,
          country: 'US'
        })
        const req = TestHelper.createRequest(`/api/user/subscriptions/set-customer-coupon?customerid=${user.customer.id}`)
        req.account = user.account
        req.session = user.session
        req.body = {
          couponid: 'invalid'
        }
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-couponid')
      })
    })

    describe('invalid-coupon', () => {
      it('invalid posted coupon is not published', async () => {
        const administrator = await TestHelper.createOwner()
        const coupon = await TestHelper.createCoupon(administrator, {
        })
        const user = await TestHelper.createUser()
        await TestHelper.createCustomer(user, {
          email: user.profile.contactEmail,
          description: user.profile.firstName,
          country: 'US'
        })
        const req = TestHelper.createRequest(`/api/user/subscriptions/set-customer-coupon?customerid=${user.customer.id}`)
        req.account = user.account
        req.session = user.session
        req.body = {
          couponid: coupon.id
        }
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-coupon')
      })

      it('invalid posted coupon is unpublished', async () => {
        const administrator = await TestHelper.createOwner()
        const coupon = await TestHelper.createCoupon(administrator, {
          published: 'true',
          unpublished: 'true'
        })
        const user = await TestHelper.createUser()
        await TestHelper.createCustomer(user, {
          email: user.profile.contactEmail,
          description: user.profile.firstName,
          country: 'US'
        })
        const req = TestHelper.createRequest(`/api/user/subscriptions/set-customer-coupon?customerid=${user.customer.id}`)
        req.account = user.account
        req.session = user.session
        req.body = {
          couponid: coupon.id
        }
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-coupon')
      })
    })
  })

  describe('returns', () => {
    it('object', async () => {
      const administrator = await TestHelper.createOwner()
      const coupon = await TestHelper.createCoupon(administrator, {
        published: 'true'
      })
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user, {
        email: user.profile.contactEmail,
        description: user.profile.firstName,
        country: 'US'
      })
      const req = TestHelper.createRequest(`/api/user/subscriptions/set-customer-coupon?customerid=${user.customer.id}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        couponid: coupon.id
      }
      req.filename = __filename
      req.saveResponse = true
      const customerNow = await req.patch()
      assert.strictEqual(customerNow.discount.coupon.id, coupon.id)
    })
  })
})
