/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/administrator/subscriptions/set-coupon-published', () => {
  describe('exceptions', () => {
    describe('invalid-couponid', () => {
      it('missing querystring couponid', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/subscriptions/set-coupon-published')
        req.account = administrator.account
        req.session = administrator.session
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-couponid')
      })

      it('invalid querystring couponid', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/subscriptions/set-coupon-published?couponid=invalid')
        req.account = administrator.account
        req.session = administrator.session
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
      it('ineligible querystring coupon is published', async () => {
        const administrator = await TestHelper.createOwner()
        await TestHelper.createCoupon(administrator, {
          published: 'true',
          percent_off: '25',
          duration: 'repeating',
          duration_in_months: '3'
        })
        const req = TestHelper.createRequest(`/api/administrator/subscriptions/set-coupon-published?couponid=${administrator.coupon.id}`)
        req.account = administrator.account
        req.session = administrator.session
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-coupon')
      })

      it('ineligible querystring coupon is unpublished', async () => {
        const administrator = await TestHelper.createOwner()
        await TestHelper.createCoupon(administrator, {
          published: 'true',
          percent_off: '25',
          duration: 'repeating',
          duration_in_months: '3'
        })
        const req = TestHelper.createRequest(`/api/administrator/subscriptions/set-coupon-published?couponid=${administrator.coupon.id}`)
        req.account = administrator.account
        req.session = administrator.session
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
      await TestHelper.createCoupon(administrator, {
        percent_off: '25',
        duration: 'repeating',
        duration_in_months: '3'
      })
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/set-coupon-published?couponid=${administrator.coupon.id}`)
      req.account = administrator.account
      req.session = administrator.session
      req.filename = __filename
      req.saveResponse = true
      const coupon = await req.patch()
      assert.notStrictEqual(coupon.metadata.published, undefined)
      assert.notStrictEqual(coupon.metadata.published, null)
    })
  })
})
