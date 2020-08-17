/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/administrator/subscriptions/create-product', () => {
  describe('exceptions', () => {
    describe('invalid-name', () => {
      it('missing posted name', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/subscriptions/create-product')
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          name: '',
          statement_descriptor: 'description',
          unit_label: 'thing'
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-name')
      })
    })

    describe('invalid-product-name-length', () => {
      it('posted name too short', async () => {
        global.minimumProductNameLength = 10
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/subscriptions/create-product')
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          name: 'this',
          statement_descriptor: 'description',
          unit_label: 'thing'
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-product-name-length')
      })

      it('posted name too long', async () => {
        global.maximumProductNameLength = 1
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/subscriptions/create-product')
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          name: 'that',
          statement_descriptor: 'description',
          unit_label: 'thing'
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-product-name-length')
      })
    })

    describe('invalid-statement_descriptor', () => {
      it('missing posted statement_descriptor', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/subscriptions/create-product')
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          name: 'productName',
          statement_descriptor: '',
          unit_label: 'thing'
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-statement_descriptor')
      })
    })
  })

  describe('receives', () => {
    it('optional posted published (boolean)', async () => {
      const administrator = await TestHelper.createOwner()
      await TestHelper.createProduct(administrator, {
        published: 'true'
      })
      const req = TestHelper.createRequest('/api/administrator/subscriptions/create-product')
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        name: 'product' + new Date().getTime() + 'r' + Math.ceil(Math.random() * 1000),
        statement_descriptor: 'description',
        unit_label: 'thing',
        published: 'true'
      }
      const product = await req.post()
      assert.notStrictEqual(product.metadata.published, undefined)
      assert.notStrictEqual(product.metadata.published, null)
    })
  })

  describe('returns', () => {
    it('object', async () => {
      const administrator = await TestHelper.createOwner()
      await TestHelper.createProduct(administrator, {
        published: 'true'
      })
      const req = TestHelper.createRequest('/api/administrator/subscriptions/create-product')
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        name: 'product' + new Date().getTime() + 'r' + Math.ceil(Math.random() * 1000),
        statement_descriptor: 'description',
        unit_label: 'thing'
      }
      req.filename = __filename
      req.saveResponse = true
      const product = await req.post()
      assert.strictEqual(product.object, 'product')
    })
  })

  describe('configuration', () => {
    it('environment MINIMUM_PRODUCT_NAME_LENGTH', async () => {
      global.minimumProductNameLength = 10
      const administrator = await TestHelper.createOwner()
      const req = TestHelper.createRequest('/api/administrator/subscriptions/create-product')
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        name: 'this',
        statement_descriptor: 'description',
        unit_label: 'thing'
      }
      let errorMessage
      try {
        await req.post()
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-product-name-length')
    })

    it('environment MAXIMUM_PRODUCT_NAME_LENGTH', async () => {
      global.maximumProductNameLength = 1
      const administrator = await TestHelper.createOwner()
      const req = TestHelper.createRequest('/api/administrator/subscriptions/create-product')
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        name: 'that',
        statement_descriptor: 'description',
        unit_label: 'thing'
      }
      let errorMessage
      try {
        await req.post()
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-product-name-length')
    })
  })
})
