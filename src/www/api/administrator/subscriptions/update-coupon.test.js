/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/administrator/subscriptions/update-coupon', () => {
  describe('exceptions', () => {
    describe('invalid-couponid', () => {
      it('missing querystring couponid', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/subscriptions/update-coupon')
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          name: 'name'
        }
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
        const req = TestHelper.createRequest('/api/administrator/subscriptions/update-coupon?couponid=invalid')
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          name: 'name'
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
      it('ineligible querystring coupon is unpublished', async () => {
        const administrator = await TestHelper.createOwner()
        await TestHelper.createCoupon(administrator, {
          published: 'true',
          unpublished: 'true',
          percent_off: '25',
          duration: 'repeating',
          duration_in_months: '3'
        })
        const req = TestHelper.createRequest(`/api/administrator/subscriptions/update-coupon?couponid=${administrator.coupon.id}`)
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          name: 'new-name',
          statement_descriptor: 'new-description',
          unit_label: 'new-thing'
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

    describe('invalid-name', () => {
      it('missing posted name', async () => {
        const administrator = await TestHelper.createOwner()
        await TestHelper.createCoupon(administrator, {
          published: 'true',
          percent_off: '25',
          duration: 'repeating',
          duration_in_months: '3'
        })
        const req = TestHelper.createRequest(`/api/administrator/subscriptions/update-coupon?couponid=${administrator.coupon.id}`)
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          name: ''
        }
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-name')
      })

      it('invalid posted name', async () => {
        const administrator = await TestHelper.createOwner()
        await TestHelper.createCoupon(administrator, {
          published: 'true',
          percent_off: '25',
          duration: 'repeating',
          duration_in_months: '3'
        })
        const req = TestHelper.createRequest(`/api/administrator/subscriptions/update-coupon?couponid=${administrator.coupon.id}`)
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          name: ''
        }
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-name')
      })
    })
  })

  describe('receives', () => {
    it('required posted name', async () => {
      const administrator = await TestHelper.createOwner()
      await TestHelper.createCoupon(administrator, {
        published: 'true',
        percent_off: '25',
        duration: 'repeating',
        duration_in_months: '3'
      })
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/update-coupon?couponid=${administrator.coupon.id}`)
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        name: 'testing'
      }
      const couponNow = await req.patch(req)
      assert.strictEqual(couponNow.name, 'testing')
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
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/update-coupon?couponid=${administrator.coupon.id}`)
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        name: 'new-name'
      }
      req.filename = __filename
      req.saveResponse = true
      const coupon = await req.patch()
      assert.strictEqual(coupon.object, 'coupon')
    })
  })
})
