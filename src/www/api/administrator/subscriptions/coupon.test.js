/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/administrator/subscriptions/coupon', () => {
  describe('exceptions', () => {
    describe('invalid-couponid', () => {
      it('missing querystring couponid', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/subscriptions/coupon')
        req.account = administrator.account
        req.session = administrator.session
        let errorMessage
        try {
          await req.get()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-couponid')
      })

      it('invalid querystring couponid', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/subscriptions/coupon?couponid=invalid')
        req.account = administrator.account
        req.session = administrator.session
        let errorMessage
        try {
          await req.get()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-couponid')
      })
    })
  })

  describe('returns', () => {
    it('object', async () => {
      const administrator = await TestHelper.createOwner()
      await TestHelper.createCoupon(administrator, {
        published: 'true',
        percent_off: '25',
        duration: 'repeating',
        duration_in_months: '3'
      })
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/coupon?couponid=${administrator.coupon.id}`)
      req.account = administrator.account
      req.session = administrator.session
      req.filename = __filename
      req.saveResponse = true
      const coupon = await req.get()
      assert.strictEqual(coupon.id, administrator.coupon.id)
    })
  })
})
