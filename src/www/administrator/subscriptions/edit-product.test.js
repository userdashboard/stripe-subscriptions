/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/administrator/subscriptions/edit-product', function () {
  describe('before', () => {
    it('should reject invalid productid', async () => {
      const administrator = await TestHelper.createOwner()
      const req = TestHelper.createRequest('/administrator/subscriptions/edit-product?productid=invalid')
      req.account = administrator.account
      req.session = administrator.session
      let errorMessage
      try {
        await req.route.api.before(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-productid')
    })

    it('should reject unpublished product', async () => {
      const administrator = await TestHelper.createOwner()
      await TestHelper.createProduct(administrator, {
        published: 'true',
        unpublished: 'true'
      })
      const req = TestHelper.createRequest(`/administrator/subscriptions/edit-product?productid=${administrator.product.id}`)
      req.account = administrator.account
      req.session = administrator.session
      let errorMessage
      try {
        await req.route.api.before(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-product')
    })

    it('should bind data to req', async () => {
      const administrator = await TestHelper.createOwner()
      await TestHelper.createProduct(administrator, {
        published: 'true'
      })
      const req = TestHelper.createRequest(`/administrator/subscriptions/edit-product?productid=${administrator.product.id}`)
      req.account = administrator.account
      req.session = administrator.session
      await req.route.api.before(req)
      assert.strictEqual(req.data.product.id, administrator.product.id)
    })
  })

  describe('view', () => {
    it('should present the form', async () => {
      const administrator = await TestHelper.createOwner()
      await TestHelper.createProduct(administrator, {
        published: 'true'
      })
      const req = TestHelper.createRequest(`/administrator/subscriptions/edit-product?productid=${administrator.product.id}`)
      req.account = administrator.account
      req.session = administrator.session
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      assert.strictEqual(doc.getElementById('submit-form').tag, 'form')
      assert.strictEqual(doc.getElementById('submit-button').tag, 'button')
    })
  })

  describe('submit', () => {
    it('should reject missing name', async () => {
      const administrator = await TestHelper.createOwner()
      await TestHelper.createProduct(administrator, {
        published: 'true'
      })
      const req = TestHelper.createRequest(`/administrator/subscriptions/edit-product?productid=${administrator.product.id}`)
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        name: '',
        statement_descriptor: 'description'
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-name')
    })

    it('should enforce name length', async () => {
      const administrator = await TestHelper.createOwner()
      await TestHelper.createProduct(administrator, {
        published: 'true'
      })
      const req = TestHelper.createRequest(`/administrator/subscriptions/edit-product?productid=${administrator.product.id}`)
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        name: '1234567890123456789012345678901234567890',
        statement_descriptor: 'description'
      }
      global.maximumProductNameLength = 3
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-product-name-length')
    })

    it('should reject missing statement_descriptor', async () => {
      const administrator = await TestHelper.createOwner()
      await TestHelper.createProduct(administrator, {
        published: 'true'
      })
      const req = TestHelper.createRequest(`/administrator/subscriptions/edit-product?productid=${administrator.product.id}`)
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        name: 'product',
        statement_descriptor: ''
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-statement_descriptor')
    })

    it('should reject invalid unit_label', async () => {
      const administrator = await TestHelper.createOwner()
      await TestHelper.createProduct(administrator, {
        published: 'true'
      })
      const req = TestHelper.createRequest(`/administrator/subscriptions/edit-product?productid=${administrator.product.id}`)
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        name: 'product',
        statement_descriptor: 'new-descriptor',
        unit_label: ''
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-unit_label')
    })

    it('should update product (screenshots)', async () => {
      const administrator = await TestHelper.createOwner()
      await TestHelper.createProduct(administrator, {
        published: 'true'
      })
      const req = TestHelper.createRequest(`/administrator/subscriptions/edit-product?productid=${administrator.product.id}`)
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        name: 'new-product-name',
        statement_descriptor: 'new-descriptor',
        unit_label: 'thing'
      }
      req.filename = __filename
      req.screenshots = [
        { hover: '#administrator-menu-container' },
        { click: '/administrator/subscriptions' },
        { click: '/administrator/subscriptions/products' },
        { click: `/administrator/subscriptions/product?productid=${administrator.product.id}` },
        { click: `/administrator/subscriptions/edit-product?productid=${administrator.product.id}` },
        { fill: '#submit-form' }
      ]
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'success')
    })
  })
})
