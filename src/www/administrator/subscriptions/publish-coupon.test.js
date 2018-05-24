/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../test-helper.js')

describe(`/administrator/subscriptions/publish-coupon`, async () => {
  describe('PublishCoupon#BEFORE', () => {
    it('should reject invalid couponid', async () => {
      const administrator = await TestHelper.createAdministrator()
      const req = TestHelper.createRequest(`/administrator/subscriptions/publish-coupon?couponid=invalid`, 'GET')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
      let errorMessage
      try {
        await req.route.api.before(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-couponid')
    })

    it('should reject published coupon', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createCoupon(administrator, {published: true})
      const req = TestHelper.createRequest(`/administrator/subscriptions/publish-coupon?couponid=${administrator.coupon.id}`, 'GET')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
      let errorMessage
      try {
        await req.route.api.before(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-coupon')
    })

    it('should bind coupon to req', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createCoupon(administrator, {})
      const req = TestHelper.createRequest(`/administrator/subscriptions/publish-coupon?couponid=${administrator.coupon.id}`, 'GET')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
      await req.route.api.before(req)
      assert.notEqual(req.data, null)
      assert.notEqual(req.data.coupon, null)
      assert.equal(req.data.coupon.id, administrator.coupon.id)
    })
  })

  describe('PublishCoupon#GET', () => {
    it('should present the form', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createCoupon(administrator, {})
      const req = TestHelper.createRequest(`/administrator/subscriptions/publish-coupon?couponid=${administrator.coupon.id}`, 'GET')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        assert.notEqual(null, doc)
        assert.notEqual(null, doc.getElementById('submitForm'))
        assert.notEqual(null, doc.getElementById('submitButton'))
      }
      return req.route.api.get(req, res)
    })
  })

  describe('PublishCoupon#POST', () => {
    it('should apply after authorization', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createCoupon(administrator, {})
      const req = TestHelper.createRequest(`/administrator/subscriptions/publish-coupon?couponid=${administrator.coupon.id}`, 'POST')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
      req.body = {}
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        await TestHelper.completeAuthorization(req)
        const res2 = TestHelper.createResponse()
        res2.end = async (str) => {
          const doc = TestHelper.extractDoc(str)
          const messageContainer = doc.getElementById('messageContainer')
          assert.notEqual(null, messageContainer)
          assert.notEqual(null, messageContainer.child)
          const message = messageContainer.child[0]
          assert.equal('success', message.attr.error)
        }
        return req.route.api.post(req, res2)
      }
      return req.route.api.post(req, res)
    })
  })
})
