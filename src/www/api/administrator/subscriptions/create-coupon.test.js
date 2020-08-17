/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/administrator/subscriptions/create-coupon', () => {
  describe('exceptions', () => {
    describe('invalid-couponid', () => {
      it('missing posted couponid', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/subscriptions/create-coupon')
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          couponid: '',
          amount_off: '',
          percent_off: ''
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-couponid')
      })

      it('invalid posted couponid is not alphanumeric_', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/subscriptions/create-coupon')
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          couponid: '#$%@#$%@#$%',
          amount_off: '',
          percent_off: ''
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-couponid')
      })
    })

    describe('invalid-amount_off', () => {
      it('missing posted amount_off', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/subscriptions/create-coupon')
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          couponid: 'coupon' + new Date().getTime() + 'r' + Math.ceil(Math.random() * 1000),
          amount_off: '',
          percent_off: ''
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-amount_off')
      })

      it('invalid posted amount_off', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/subscriptions/create-coupon')
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          couponid: 'coupon' + new Date().getTime() + 'r' + Math.ceil(Math.random() * 1000),
          amount_off: 'invalid',
          percent_off: ''
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-amount_off')
      })
    })

    describe('invalid-currency', () => {
      it('missing posted currency', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/subscriptions/create-coupon')
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          couponid: 'coupon' + new Date().getTime() + 'r' + Math.ceil(Math.random() * 1000),
          amount_off: '1',
          currency: ''
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-currency')
      })

      it('invalid posted currency', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/subscriptions/create-coupon')
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          couponid: 'coupon' + new Date().getTime() + 'r' + Math.ceil(Math.random() * 1000),
          amount_off: '1',
          currency: 'invalid'
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-currency')
      })
    })

    describe('invalid-percent_off', () => {
      it('invalid posted percent_off', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/subscriptions/create-coupon')
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          couponid: 'coupon' + new Date().getTime() + 'r' + Math.ceil(Math.random() * 1000),
          percent_off: 'invalid'
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-percent_off')
        req.body = {
          couponid: 'coupon' + new Date().getTime() + 'r' + Math.ceil(Math.random() * 1000),
          percent_off: '101'
        }
        errorMessage = null
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-percent_off')
      })
    })

    describe('invalid-duration', () => {
      it('invalid posted duration', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/subscriptions/create-coupon')
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          couponid: 'coupon' + new Date().getTime() + 'r' + Math.ceil(Math.random() * 1000),
          amount_off: '10',
          currency: 'usd',
          duration: 'invalid'
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-duration')
      })
    })

    describe('invalid-duration_in_months', () => {
      it('missing posted duration_in_months', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/subscriptions/create-coupon')
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          couponid: 'coupon' + new Date().getTime() + 'r' + Math.ceil(Math.random() * 1000),
          amount_off: '10',
          currency: 'usd',
          duration: 'repeating',
          duration_in_months: ''
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-duration_in_months')
      })

      it('invalid posted duration_in_months', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/subscriptions/create-coupon')
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          couponid: 'coupon' + new Date().getTime() + 'r' + Math.ceil(Math.random() * 1000),
          amount_off: '10',
          currency: 'usd',
          duration: 'repeating',
          duration_in_months: 'invalid'
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-duration_in_months')
      })
    })

    describe('invalid-redeem_by_meridiem', () => {
      it('invalid posted redeem_by_meridiem', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/subscriptions/create-coupon')
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          couponid: 'coupon' + new Date().getTime() + 'r' + Math.ceil(Math.random() * 1000),
          amount_off: '10',
          currency: 'usd',
          duration: 'repeating',
          duration_in_months: '1',
          redeem_by_minute: '1',
          redeem_by_hour: '1',
          redeem_by_day: '1',
          redeem_by_month: '1',
          redeem_by_year: '1750',
          redeem_by_meridiem: ''
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-redeem_by_meridiem')
      })
    })

    describe('invalid-redeem_by', () => {
      it('invalid posted redeem_by', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/subscriptions/create-coupon')
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          couponid: 'coupon' + new Date().getTime() + 'r' + Math.ceil(Math.random() * 1000),
          amount_off: '10',
          currency: 'usd',
          duration: 'repeating',
          duration_in_months: '1',
          redeem_by_minute: '1',
          redeem_by_hour: '1',
          redeem_by_day: '1',
          redeem_by_month: '1',
          redeem_by_year: '1750',
          redeem_by_meridiem: 'AM'
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-redeem_by')
      })
    })
  })

  describe('receives', () => {
    it('required posted duration', async () => {
    })

    it('optionally-required posted amount_off (integer, or percent_off)', async () => {
    })

    it('optionally-required posted currency (string, if amount_off)', async () => {
    })

    it('optionally-required posted percent_off (integer, or amount_off)', async () => {
    })

    it('optionally-required posted expire date ', async () => {

    })

    it('optionally-required posted duration_in_months', async () => {

    })
  })

  describe('returns', () => {
    it('object', async () => {
      const administrator = await TestHelper.createOwner()
      const req = TestHelper.createRequest('/api/administrator/subscriptions/create-coupon')
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        couponid: 'coupon' + new Date().getTime() + 'r' + Math.ceil(Math.random() * 1000),
        amount_off: '10',
        currency: 'usd',
        duration: 'repeating',
        duration_in_months: '1',
        redeem_by_minute: '1',
        redeem_by_hour: '1',
        redeem_by_day: '1',
        redeem_by_month: '1',
        redeem_by_year: (new Date().getFullYear() + 1).toString().substring(2),
        redeem_by_meridiem: 'AM'
      }
      req.filename = __filename
      req.saveResponse = true
      const coupon = await req.post()
      assert.strictEqual(coupon.object, 'coupon')
    })
  })
})
