/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../test-helper.js')

describe(`/administrator/subscriptions/unpublish-product`, async () => {
  describe('UnpublishProduct#BEFORE', () => {
    it('should reject invalid productid', async () => {
      const administrator = await TestHelper.createAdministrator()
      const req = TestHelper.createRequest(`/administrator/subscriptions/unpublish-product?productid=invalid`, 'GET')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
      let errorMessage
      try {
        await req.route.api.before(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-productid')
    })

    it('should never published product', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createProduct(administrator, {})
      const req = TestHelper.createRequest(`/administrator/subscriptions/unpublish-product?productid=${administrator.product.id}`, 'GET')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
      let errorMessage
      try {
        await req.route.api.before(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-product')
    })

    it('should reject unpublished product', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createProduct(administrator, {published: true, unpublished: true})
      const req = TestHelper.createRequest(`/administrator/subscriptions/unpublish-product?productid=${administrator.product.id}`, 'GET')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
      let errorMessage
      try {
        await req.route.api.before(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-product')
    })

    it('should bind product to req', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createProduct(administrator, {published: true})
      const req = TestHelper.createRequest(`/administrator/subscriptions/unpublish-product?productid=${administrator.product.id}`, 'GET')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
      await req.route.api.before(req)
      assert.notEqual(req.data, null)
      assert.notEqual(req.data.product, null)
      assert.equal(req.data.product.id, administrator.product.id)
    })
  })

  describe('UnpublishProduct#GET', () => {
    it('should present the form', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createProduct(administrator, {published: true})
      const req = TestHelper.createRequest(`/administrator/subscriptions/unpublish-product?productid=${administrator.product.id}`, 'GET')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        assert.notEqual(null, doc)
        assert.notEqual(null, doc.getElementById('submit-form'))
        assert.notEqual(null, doc.getElementById('submit-button'))
      }
      return req.route.api.get(req, res)
    })

    it('should present the product table', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createProduct(administrator, {published: true})
      const req = TestHelper.createRequest(`/administrator/subscriptions/unpublish-product?productid=${administrator.product.id}`, 'GET')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        const tr = doc.getElementById(administrator.product.id)
        assert.notEqual(null, tr)
      }
      return req.route.api.get(req, res)
    })
  })

  describe('UnpublishProduct#POST', () => {
    it('should apply after authorization', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createProduct(administrator, {published: true})
      const req = TestHelper.createRequest(`/administrator/subscriptions/unpublish-product?productid=${administrator.product.id}`, 'POST')
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
          const messageContainer = doc.getElementById('message-container')
          assert.notEqual(null, messageContainer)
          assert.notEqual(null, messageContainer.child)
          const message = messageContainer.child[0]
          assert.equal('success', message.attr.template)
        }
        return req.route.api.post(req, res2)
      }
      return req.route.api.post(req, res)
    })
  })
})
