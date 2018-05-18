/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe(`/api/administrator/subscriptions/create-coupon`, () => {
  describe('CreateCoupon#POST', () => {
    it('should require alphanumeric id', async () => {
      const administrator = await TestHelper.createAdministrator()
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/create-coupon`, 'POST')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
      req.body = {
        couponid: `coupon_`,
        amount_off: null,
        percent_off: null
      }
      try {
        await req.route.api.post(req)
      } catch (error) {
        assert.equal(error.message, 'invalid-couponid')
      }
    })

    it('should require percent or amount off', async () => {
      const administrator = await TestHelper.createAdministrator()
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/create-coupon`, 'POST')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
      req.body = {
        couponid: `coupon` + new Date().getTime() + 'r' + Math.ceil(Math.random() * 1000),
        amount_off: null,
        percent_off: null
      }
      try {
        await req.route.api.post(req)
      } catch (error) {
        assert.equal(error.message, 'invalid-amount_off')
      }
    })

    it('should require currency with amount off', async () => {
      const administrator = await TestHelper.createAdministrator()
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/create-coupon`, 'POST')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
      req.body = {
        couponid: `coupon` + new Date().getTime() + 'r' + Math.ceil(Math.random() * 1000),
        amount_off: 1,
        currency: ''
      }
      try {
        await req.route.api.post(req)
      } catch (error) {
        assert.equal(error.message, 'invalid-currency')
      }
    })

    it('should require valid percent off', async () => {
      const administrator = await TestHelper.createAdministrator()
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/create-coupon`, 'POST')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
      req.body = {
        couponid: `coupon` + new Date().getTime() + 'r' + Math.ceil(Math.random() * 1000),
        percent_off: -1
      }
      try {
        await req.route.api.post(req)
      } catch (error) {
        assert.equal(error.message, 'invalid-percent_off')
      }
      req.body = {
        couponid: `coupon` + new Date().getTime() + 'r' + Math.ceil(Math.random() * 1000),
        percent_off: 101
      }
      try {
        await req.route.api.post(req)
      } catch (error) {
        assert.equal(error.message, 'invalid-percent_off')
      }
    })

    it('should require valid duration', async () => {
      const administrator = await TestHelper.createAdministrator()
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/create-coupon`, 'POST')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
      req.body = {
        couponid: `coupon` + new Date().getTime() + 'r' + Math.ceil(Math.random() * 1000),
        amount_off: 10,
        currency: 'usd',
        duration: 'randomly'
      }
      try {
        await req.route.api.post(req)
      } catch (error) {
        assert.equal(error.message, 'invalid-duration')
      }
    })

    it('should require valid repeating duration', async () => {
      const administrator = await TestHelper.createAdministrator()
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/create-coupon`, 'POST')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
      req.body = {
        couponid: `coupon` + new Date().getTime() + 'r' + Math.ceil(Math.random() * 1000),
        amount_off: 10,
        currency: 'usd',
        duration: 'repeating',
        duration_in_months: 'b'
      }
      try {
        await req.route.api.post(req)
      } catch (error) {
        assert.equal(error.message, 'invalid-duration_in_months')
      }
    })

    it('should require valid expire_meridien', async () => {
      const administrator = await TestHelper.createAdministrator()
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/create-coupon`, 'POST')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
      req.body = {
        couponid: `coupon` + new Date().getTime() + 'r' + Math.ceil(Math.random() * 1000),
        amount_off: 10,
        currency: 'usd',
        duration: 'repeating',
        duration_in_months: '1',
        expire_meridien: 'ZM'
      }
      try {
        await req.route.api.post(req)
      } catch (error) {
        assert.equal(error.message, 'invalid-expire_meridien')
      }
    })

    it('should require valid expire', async () => {
      const administrator = await TestHelper.createAdministrator()
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/create-coupon`, 'POST')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
      req.body = {
        couponid: `coupon` + new Date().getTime() + 'r' + Math.ceil(Math.random() * 1000),
        amount_off: 10,
        currency: 'usd',
        duration: 'repeating',
        duration_in_months: '1',
        expire_minute: '1',
        expire_hour: '1',
        expire_day: '1',
        expire_month: '1',
        expire_year: (new Date().getFullYear() - 10).toString(),
        expire_meridien: 'AM'
      }
      try {
        await req.route.api.post(req)
      } catch (error) {
        assert.equal(error.message, 'invalid-expire')
      }
    })

    it('should create coupon', async () => {
      const administrator = await TestHelper.createAdministrator()
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/create-coupon`, 'POST')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
      req.body = {
        couponid: `coupon` + new Date().getTime() + 'r' + Math.ceil(Math.random() * 1000),
        amount_off: '10',
        currency: 'usd',
        duration: 'repeating',
        duration_in_months: '1',
        expire_minute: '1',
        expire_hour: '1',
        expire_day: '1',
        expire_month: '1',
        expire_year: (new Date().getFullYear() + 1).toString(),
        expire_meridien: 'AM'
      }
      await req.route.api.post(req)
      await TestHelper.completeAuthorization(req)
      const coupon = await req.route.api.post(req)
      assert.notEqual(null, coupon)
    })
  })
})
