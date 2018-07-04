/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe(`/api/administrator/subscriptions/create-coupon`, () => {
  describe('CreateCoupon#POST', () => {
    it('should require alphanumeric id', async () => {
      const administrator = await TestHelper.createAdministrator()
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/create-coupon`, 'POST')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      req.body = {
        couponid: `coupon_`,
        amount_off: null,
        percent_off: null
      }
      let errorMessage
      try {
        await req.route.api.post(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-couponid')
    })

    it('should require percent or amount off', async () => {
      const administrator = await TestHelper.createAdministrator()
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/create-coupon`, 'POST')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      req.body = {
        couponid: `coupon` + new Date().getTime() + 'r' + Math.ceil(Math.random() * 1000),
        amount_off: null,
        percent_off: null
      }
      let errorMessage
      try {
        await req.route.api.post(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-amount_off')
    })

    it('should require currency with amount off', async () => {
      const administrator = await TestHelper.createAdministrator()
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/create-coupon`, 'POST')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      req.body = {
        couponid: `coupon` + new Date().getTime() + 'r' + Math.ceil(Math.random() * 1000),
        amount_off: 1,
        currency: ''
      }
      let errorMessage
      try {
        await req.route.api.post(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-currency')
    })

    it('should require valid percent off', async () => {
      const administrator = await TestHelper.createAdministrator()
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/create-coupon`, 'POST')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      req.body = {
        couponid: `coupon` + new Date().getTime() + 'r' + Math.ceil(Math.random() * 1000),
        percent_off: -1
      }
      let errorMessage
      try {
        await req.route.api.post(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-percent_off')
      req.body = {
        couponid: `coupon` + new Date().getTime() + 'r' + Math.ceil(Math.random() * 1000),
        percent_off: 101
      }
      errorMessage = null
      try {
        await req.route.api.post(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-percent_off')
    })

    it('should require valid duration', async () => {
      const administrator = await TestHelper.createAdministrator()
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/create-coupon`, 'POST')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      req.body = {
        couponid: `coupon` + new Date().getTime() + 'r' + Math.ceil(Math.random() * 1000),
        amount_off: 10,
        currency: 'usd',
        duration: 'randomly'
      }
      let errorMessage
      try {
        await req.route.api.post(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-duration')
    })

    it('should require valid repeating duration', async () => {
      const administrator = await TestHelper.createAdministrator()
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/create-coupon`, 'POST')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      req.body = {
        couponid: `coupon` + new Date().getTime() + 'r' + Math.ceil(Math.random() * 1000),
        amount_off: 10,
        currency: 'usd',
        duration: 'repeating',
        duration_in_months: 'b'
      }
      let errorMessage
      try {
        await req.route.api.post(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-duration_in_months')
    })

    it('should require valid expire_meridien', async () => {
      const administrator = await TestHelper.createAdministrator()
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/create-coupon`, 'POST')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      req.body = {
        couponid: `coupon` + new Date().getTime() + 'r' + Math.ceil(Math.random() * 1000),
        amount_off: 10,
        currency: 'usd',
        duration: 'repeating',
        duration_in_months: '1',
        expire_meridien: 'ZM'
      }
      let errorMessage
      try {
        await req.route.api.post(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-expire_meridien')
    })

    it('should require valid expire', async () => {
      const administrator = await TestHelper.createAdministrator()
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/create-coupon`, 'POST')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
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
      let errorMessage
      try {
        await req.route.api.post(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-expire')
    })

    it('should create coupon', async () => {
      const administrator = await TestHelper.createAdministrator()
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/create-coupon`, 'POST')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
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
      req.administratorSession = req.session = await TestHelper.unlockSession(administrator)
      const coupon = await req.route.api.post(req)
      assert.notEqual(null, coupon)
    })

    it('should create published coupon', async () => {
      const administrator = await TestHelper.createAdministrator()
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/create-coupon`, 'POST')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
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
        expire_meridien: 'AM',
        published: 'true'
      }
      await req.route.api.post(req)
      req.administratorSession = req.session = await TestHelper.unlockSession(administrator)
      const coupon = await req.route.api.post(req)
      assert.notEqual(null, coupon)
      assert.notEqual(null, coupon.metadata.published)
    })
  })
})
