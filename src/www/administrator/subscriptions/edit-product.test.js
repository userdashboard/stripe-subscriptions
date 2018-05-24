/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../test-helper.js')

describe(`/administrator/subscriptions/edit-product`, () => {
  describe('EditProduct#BEFORE', () => {
    it('should reject invalid productid', async () => {
      const administrator = await TestHelper.createAdministrator()
      const req = TestHelper.createRequest(`/administrator/subscriptions/edit-product?productid=invalid`, 'GET')
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

    it('should reject unpublished product', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createProduct(administrator, {published: true, unpublished: true})
      const req = TestHelper.createRequest(`/administrator/subscriptions/edit-product?productid=${administrator.product.id}`, 'GET')
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
      const req = TestHelper.createRequest(`/administrator/subscriptions/edit-product?productid=${administrator.product.id}`, 'GET')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
      await req.route.api.before(req)
      assert.notEqual(req.data, null)
      assert.notEqual(req.data.product, null)
      assert.equal(req.data.product.id, administrator.product.id)
    })
  })

  describe('EditProduct#GET', () => {
    it('should present the form', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createProduct(administrator, {published: true})
      const req = TestHelper.createRequest(`/administrator/subscriptions/edit-product?productid=${administrator.product.id}`, 'GET')
      req.account = administrator.account
      req.session = administrator.session
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

  describe('EditProduct#POST', () => {
    it('should reject missing name', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createProduct(administrator, {published: true})
      const req = TestHelper.createRequest(`/administrator/subscriptions/edit-product?productid=${administrator.product.id}`, 'POST')
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        name: null,
        statement_descriptor: 'description'
      }
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        const messageContainer = doc.getElementById('messageContainer')
        assert.notEqual(null, messageContainer)
        assert.notEqual(null, messageContainer.child)
        const message = messageContainer.child[0]
        assert.equal('invalid-name', message.attr.error)
      }
      return req.route.api.post(req, res)
    })

    it('should enforce name length', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createProduct(administrator, {published: true})
      const req = TestHelper.createRequest(`/administrator/subscriptions/edit-product?productid=${administrator.product.id}`, 'POST')
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        name: '1234567890123456789012345678901234567890',
        statement_descriptor: 'description'
      }
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        const messageContainer = doc.getElementById('messageContainer')
        assert.notEqual(null, messageContainer)
        assert.notEqual(null, messageContainer.child)
        const message = messageContainer.child[0]
        assert.equal('invalid-product-name-length', message.attr.error)
      }
      global.MAXIMUM_PRODUCT_NAME_LENGTH = 3
      return req.route.api.post(req, res)
    })

    it('should reject missing statement_descriptor', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createProduct(administrator, {published: true})
      const req = TestHelper.createRequest(`/administrator/subscriptions/edit-product?productid=${administrator.product.id}`, 'POST')
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        name: 'product',
        statement_descriptor: null
      }
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        const messageContainer = doc.getElementById('messageContainer')
        assert.notEqual(null, messageContainer)
        assert.notEqual(null, messageContainer.child)
        const message = messageContainer.child[0]
        assert.equal('invalid-statement_descriptor', message.attr.error)
      }
      return req.route.api.post(req, res)
    })

    it('should reject invalid unit_label', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createProduct(administrator, {published: true})
      const req = TestHelper.createRequest(`/administrator/subscriptions/edit-product?productid=${administrator.product.id}`, 'POST')
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        name: administrator.product.name,
        statement_descriptor: 'new-descriptor',
        unit_label: null
      }
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        const messageContainer = doc.getElementById('messageContainer')
        assert.notEqual(null, messageContainer)
        assert.notEqual(null, messageContainer.child)
        const message = messageContainer.child[0]
        assert.equal('invalid-unit_label', message.attr.error)
      }
      return req.route.api.post(req, res)
    })

    it('should update after authorization', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createProduct(administrator, {published: true})
      const req = TestHelper.createRequest(`/administrator/subscriptions/edit-product?productid=${administrator.product.id}`, 'POST')
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        name: 'new-product-name',
        statement_descriptor: 'new-descriptor',
        unit_label: 'thing'
      }
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        await TestHelper.completeAuthorization(req)
        const res3 = TestHelper.createResponse()
        res3.end = async (str) => {
          const doc = TestHelper.extractDoc(str)
          const messageContainer = doc.getElementById('messageContainer')
          assert.notEqual(null, messageContainer)
          assert.notEqual(null, messageContainer.child)
          const message = messageContainer.child[0]
          assert.equal('success', message.attr.error)
        }
        return req.route.api.get(req, res3)
      }
      return req.route.api.post(req, res)
    })
  })
})
