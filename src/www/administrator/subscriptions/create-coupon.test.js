/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/administrator/subscriptions/create-coupon', () => {
  describe('CreateCoupon#GET', () => {
    it('should present the form', async () => {
      const administrator = await TestHelper.createAdministrator()
      const req = TestHelper.createRequest('/administrator/subscriptions/create-coupon', 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        assert.notEqual(null, doc)
        assert.notEqual(null, doc.getElementById('couponid'))
        assert.notEqual(null, doc.getElementById('submit-form'))
        assert.notEqual(null, doc.getElementById('submit-button'))
      }
      return req.route.api.get(req, res)
    })
  })

  describe('CreateCoupon#POST', () => {
    it('should reject missing couponid', async () => {
      const administrator = await TestHelper.createAdministrator()
      const req = TestHelper.createRequest('/administrator/subscriptions/create-coupon', 'POST')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      req.body = {
        couponid: null,
        duration: 'once',
        redeem_by: '',
        amount_off: '100',
        max_redemptions: '1',
        currency: 'usd'
      }
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        const messageContainer = doc.getElementById('message-container')
        assert.notEqual(null, messageContainer)
        assert.notEqual(null, messageContainer.child)
        const message = messageContainer.child[0]
        assert.equal('invalid-couponid', message.attr.template)
      }
      return req.route.api.post(req, res)
    })

    it('should enforce couponid length', async () => {
      const administrator = await TestHelper.createAdministrator()
      const req = TestHelper.createRequest('/administrator/subscriptions/create-coupon', 'POST')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      req.body = {
        couponid: '1234567890123456789012345678901234567890',
        duration: 'once',
        redeem_by: '',
        amount_off: '100',
        max_redemptions: '1',
        currency: 'usd'
      }
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        const messageContainer = doc.getElementById('message-container')
        assert.notEqual(null, messageContainer)
        assert.notEqual(null, messageContainer.child)
        const message = messageContainer.child[0]
        assert.equal('invalid-couponid-length', message.attr.template)
      }
      global.MAXIMUM_COUPON_LENGTH = 3
      return req.route.api.post(req, res)
    })

    it('should reject duplicate couponid', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createCoupon(administrator, {published: true, percent_off: 25, duration: 'repeating', duration_in_months: 3})
      const req = TestHelper.createRequest('/administrator/subscriptions/create-coupon', 'POST')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      req.body = {
        couponid: administrator.coupon.id,
        duration: 'once',
        redeem_by: '',
        amount_off: '100',
        max_redemptions: '1',
        currency: 'usd'
      }
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        const messageContainer = doc.getElementById('message-container')
        assert.notEqual(null, messageContainer)
        assert.notEqual(null, messageContainer.child)
        const message = messageContainer.child[0]
        assert.equal('invalid-couponid', message.attr.template)
      }
      return req.route.api.post(req, res)
    })

    it('should reject missing duration', async () => {
      const administrator = await TestHelper.createAdministrator()
      const req = TestHelper.createRequest('/administrator/subscriptions/create-coupon', 'POST')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      req.body = {
        couponid: 'coupon' + new Date().getTime(),
        duration: '',
        redeem_by: '',
        amount_off: '100',
        max_redemptions: '1',
        currency: 'usd'
      }
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        const messageContainer = doc.getElementById('message-container')
        assert.notEqual(null, messageContainer)
        assert.notEqual(null, messageContainer.child)
        const message = messageContainer.child[0]
        assert.equal('invalid-duration', message.attr.template)
      }
      return req.route.api.post(req, res)
    })

    it('should enforce invalid duration', async () => {
      const administrator = await TestHelper.createAdministrator()
      const req = TestHelper.createRequest('/administrator/subscriptions/create-coupon', 'POST')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      req.body = {
        couponid: 'coupon' + new Date().getTime(),
        duration: 'invalid',
        redeem_by: '',
        amount_off: '100',
        max_redemptions: '1',
        currency: 'usd'
      }
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        const messageContainer = doc.getElementById('message-container')
        assert.notEqual(null, messageContainer)
        assert.notEqual(null, messageContainer.child)
        const message = messageContainer.child[0]
        assert.equal('invalid-duration', message.attr.template)
      }
      return req.route.api.post(req, res)
    })

    it('should require valid amount off', async () => {
      const administrator = await TestHelper.createAdministrator()
      const req = TestHelper.createRequest('/administrator/subscriptions/create-coupon', 'POST')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      req.body = {
        couponid: 'coupon' + new Date().getTime(),
        duration: 'once',
        redeem_by: '',
        amount_off: 'invalid',
        max_redemptions: '1',
        currency: 'usd'
      }
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        const messageContainer = doc.getElementById('message-container')
        assert.notEqual(null, messageContainer)
        assert.notEqual(null, messageContainer.child)
        const message = messageContainer.child[0]
        assert.equal('invalid-amount_off', message.attr.template)
      }
      return req.route.api.post(req, res)
    })

    it('should require valid percent off', async () => {
      const administrator = await TestHelper.createAdministrator()
      const req = TestHelper.createRequest('/administrator/subscriptions/create-coupon', 'POST')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      req.body = {
        couponid: 'coupon' + new Date().getTime(),
        duration: 'once',
        redeem_by: '',
        percent_off: '-3',
        max_redemptions: '1',
        currency: 'usd'
      }
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        const messageContainer = doc.getElementById('message-container')
        assert.notEqual(null, messageContainer)
        assert.notEqual(null, messageContainer.child)
        const message = messageContainer.child[0]
        assert.equal('invalid-percent_off', message.attr.template)
      }
      return req.route.api.post(req, res)
    })

    it('should require valid max redemptions', async () => {
      const administrator = await TestHelper.createAdministrator()
      const req = TestHelper.createRequest('/administrator/subscriptions/create-coupon', 'POST')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      req.body = {
        couponid: 'coupon' + new Date().getTime(),
        duration: 'once',
        redeem_by: '',
        percent_off: '30',
        max_redemptions: 'invalid',
        currency: 'usd'
      }
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        const messageContainer = doc.getElementById('message-container')
        assert.notEqual(null, messageContainer)
        assert.notEqual(null, messageContainer.child)
        const message = messageContainer.child[0]
        assert.equal('invalid-max_redemptions', message.attr.template)
      }
      return req.route.api.post(req, res)
    })

    it('should require amount or percent off', async () => {
      const administrator = await TestHelper.createAdministrator()
      const req = TestHelper.createRequest('/administrator/subscriptions/create-coupon', 'POST')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      req.body = {
        couponid: 'coupon' + new Date().getTime(),
        duration: 'once',
        redeem_by: '',
        max_redemptions: '1',
        currency: 'usd'
      }
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        const messageContainer = doc.getElementById('message-container')
        assert.notEqual(null, messageContainer)
        assert.notEqual(null, messageContainer.child)
        const message = messageContainer.child[0]
        assert.equal('invalid-discount', message.attr.template)
      }
      return req.route.api.post(req, res)
    })

    it('should require valid duration in months if repeating', async () => {
      const administrator = await TestHelper.createAdministrator()
      const req = TestHelper.createRequest('/administrator/subscriptions/create-coupon', 'POST')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      req.body = {
        couponid: 'coupon' + new Date().getTime(),
        duration: 'repeating',
        duration_in_months: 'invalid',
        amount_off: 700,
        redeem_by: '',
        max_redemptions: '1',
        currency: 'usd'
      }
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        const messageContainer = doc.getElementById('message-container')
        assert.notEqual(null, messageContainer)
        assert.notEqual(null, messageContainer.child)
        const message = messageContainer.child[0]
        assert.equal('invalid-duration_in_months', message.attr.template)
      }
      return req.route.api.post(req, res)
    })

    it('should require valid expires if provided', async () => {
      const administrator = await TestHelper.createAdministrator()
      const req = TestHelper.createRequest('/administrator/subscriptions/create-coupon', 'POST')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      req.body = {
        couponid: 'coupon' + new Date().getTime(),
        duration: 'repeating',
        duration_in_months: '10',
        amount_off: 700,
        redeem_by: '',
        max_redemptions: '1',
        currency: 'usd',
        expire_day: 1,
        expire_month: 1,
        expire_year: 'invalid',
        expire_meridian: 'PM'
      }
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        const messageContainer = doc.getElementById('message-container')
        assert.notEqual(null, messageContainer)
        assert.notEqual(null, messageContainer.child)
        const message = messageContainer.child[0]
        assert.equal('invalid-expires', message.attr.template)
      }
      return req.route.api.post(req, res)
    })

    it('should create after authorization', async () => {
      const administrator = await TestHelper.createAdministrator()
      const req = TestHelper.createRequest('/administrator/subscriptions/create-coupon', 'POST')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      req.body = {
        couponid: 'coupon' + new Date().getTime(),
        duration: 'once',
        redeem_by: '',
        amount_off: '100',
        max_redemptions: '1',
        currency: 'usd'
      }
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        req.administratorSession = req.session = await TestHelper.unlockSession(administrator)
        const res3 = TestHelper.createResponse()
        res3.end = async (str) => {
          const doc = TestHelper.extractDoc(str)
          const messageContainer = doc.getElementById('message-container')
          assert.notEqual(null, messageContainer)
          assert.notEqual(null, messageContainer.child)
          const message = messageContainer.child[0]
          assert.equal('success', message.attr.template)
        }
        return req.route.api.get(req, res3)
      }
      return req.route.api.post(req, res)
    })
  })
})
