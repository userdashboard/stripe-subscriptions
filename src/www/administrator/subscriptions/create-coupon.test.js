/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/administrator/subscriptions/create-coupon', function () {
  describe('view', () => {
    it('should present the form', async () => {
      const administrator = await TestHelper.createOwner()
      const req = TestHelper.createRequest('/administrator/subscriptions/create-coupon')
      req.account = administrator.account
      req.session = administrator.session
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      assert.strictEqual(doc.getElementById('submit-form').tag, 'form')
      assert.strictEqual(doc.getElementById('submit-button').tag, 'button')
    })
  })

  describe('submit', () => {
    it('should reject missing couponid', async () => {
      const administrator = await TestHelper.createOwner()
      const req = TestHelper.createRequest('/administrator/subscriptions/create-coupon')
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        couponid: '',
        duration: 'once',
        amount_off: '100',
        max_redemptions: '1',
        currency: 'usd'
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-couponid')
    })

    it('should enforce couponid length', async () => {
      const administrator = await TestHelper.createOwner()
      const req = TestHelper.createRequest('/administrator/subscriptions/create-coupon')
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        couponid: '1234567890123456789012345678901234567890',
        duration: 'once',
        amount_off: '100',
        max_redemptions: '1',
        currency: 'usd'
      }
      global.maximumCouponLength = 3
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-couponid-length')
    })

    it('should reject duplicate couponid', async () => {
      const administrator = await TestHelper.createOwner()
      await TestHelper.createCoupon(administrator, {
        published: 'true',
        percent_off: 25,
        duration: 'repeating',
        duration_in_months: '3'
      })
      const req = TestHelper.createRequest('/administrator/subscriptions/create-coupon')
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        couponid: administrator.coupon.id,
        duration: 'once',
        amount_off: '100',
        max_redemptions: '1',
        currency: 'usd'
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-couponid')
    })

    it('should reject missing duration', async () => {
      const administrator = await TestHelper.createOwner()
      const req = TestHelper.createRequest('/administrator/subscriptions/create-coupon')
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        couponid: 'coupon' + new Date().getTime(),
        duration: '',
        amount_off: '100',
        max_redemptions: '1',
        currency: 'usd'
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-duration')
    })

    it('should enforce invalid duration', async () => {
      const administrator = await TestHelper.createOwner()
      const req = TestHelper.createRequest('/administrator/subscriptions/create-coupon')
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        couponid: 'coupon' + new Date().getTime(),
        duration: 'invalid',
        amount_off: '100',
        max_redemptions: '1',
        currency: 'usd'
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-duration')
    })

    it('should require valid amount off', async () => {
      const administrator = await TestHelper.createOwner()
      const req = TestHelper.createRequest('/administrator/subscriptions/create-coupon')
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        couponid: 'coupon' + new Date().getTime(),
        duration: 'once',
        amount_off: 'invalid',
        max_redemptions: '1',
        currency: 'usd'
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-amount_off')
    })

    it('should require valid percent off', async () => {
      const administrator = await TestHelper.createOwner()
      const req = TestHelper.createRequest('/administrator/subscriptions/create-coupon')
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        couponid: 'coupon' + new Date().getTime(),
        duration: 'once',
        percent_off: '-3',
        max_redemptions: '1',
        currency: 'usd'
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-percent_off')
    })

    it('should require valid max redemptions', async () => {
      const administrator = await TestHelper.createOwner()
      const req = TestHelper.createRequest('/administrator/subscriptions/create-coupon')
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        couponid: 'coupon' + new Date().getTime(),
        duration: 'once',
        percent_off: '30',
        max_redemptions: '-1',
        currency: 'usd'
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-max_redemptions')
    })

    it('should require amount or percent off', async () => {
      const administrator = await TestHelper.createOwner()
      const req = TestHelper.createRequest('/administrator/subscriptions/create-coupon')
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        couponid: 'coupon' + new Date().getTime(),
        duration: 'once',
        max_redemptions: '1',
        currency: 'usd'
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-discount')
    })

    it('should require valid duration in months if repeating', async () => {
      const administrator = await TestHelper.createOwner()
      const req = TestHelper.createRequest('/administrator/subscriptions/create-coupon')
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        couponid: 'coupon' + new Date().getTime(),
        duration: 'repeating',
        duration_in_months: '-1',
        amount_off: '700',
        max_redemptions: '1',
        currency: 'usd'
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-duration_in_months')
    })

    it('should require valid redeem_by if provided', async () => {
      const administrator = await TestHelper.createOwner()
      const req = TestHelper.createRequest('/administrator/subscriptions/create-coupon')
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        couponid: 'coupon' + new Date().getTime(),
        duration: 'repeating',
        duration_in_months: '10',
        amount_off: '700',
        max_redemptions: '1',
        currency: 'usd',
        redeem_by_day: '1',
        redeem_by_month: '1',
        redeem_by_year: '0',
        redeem_by_meridiem: 'PM'
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-redeem_by')
    })

    it('should create coupon (screenshots)', async () => {
      const administrator = await TestHelper.createOwner()
      const req = TestHelper.createRequest('/administrator/subscriptions/create-coupon')
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        couponid: 'coupon' + new Date().getTime(),
        duration: 'once',
        amount_off: '100',
        max_redemptions: '1',
        currency: 'usd'
      }
      req.filename = __filename
      req.screenshots = [
        { hover: '#administrator-menu-container' },
        { click: '/administrator/subscriptions' },
        { click: '/administrator/subscriptions/coupons' },
        { click: '/administrator/subscriptions/create-coupon' },
        { fill: '#submit-form' }
      ]
      const result = await req.post()
      assert.strictEqual(true, result.redirect.startsWith('/administrator/subscriptions/coupon?couponid='))
    })
  })
})
