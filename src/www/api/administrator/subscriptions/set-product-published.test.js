/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/administrator/subscriptions/set-product-published', () => {
  describe('exceptions', () => {
    describe('invalid-productid', () => {
      it('missing querystring productid', async () => {
        const administrator = await TestHelper.createOwner()
        await TestHelper.createProduct(administrator, {
          published: 'true'
        })
        const req = TestHelper.createRequest('/api/administrator/subscriptions/set-product-published?productid=invalid')
        req.account = administrator.account
        req.session = administrator.session
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-productid')
      })

      it('invalid querystring productid', async () => {
        const administrator = await TestHelper.createOwner()
        await TestHelper.createProduct(administrator, {
          published: 'true'
        })
        const req = TestHelper.createRequest('/api/administrator/subscriptions/set-product-published?productid=invalid')
        req.account = administrator.account
        req.session = administrator.session
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-productid')
      })
    })

    describe('invalid-product', () => {
      it('invalid querystring product is already published', async () => {
        const administrator = await TestHelper.createOwner()
        await TestHelper.createProduct(administrator, {
          published: 'true'
        })
        const req = TestHelper.createRequest(`/api/administrator/subscriptions/set-product-published?productid=${administrator.product.id}`)
        req.account = administrator.account
        req.session = administrator.session
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-product')
      })
    })
  })

  describe('returns', () => {
    it('object', async () => {
      const administrator = await TestHelper.createOwner()
      await TestHelper.createProduct(administrator)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/set-product-published?productid=${administrator.product.id}`)
      req.account = administrator.account
      req.session = administrator.session
      req.filename = __filename
      req.saveResponse = true
      const product = await req.patch()
      assert.notStrictEqual(product.metadata.published, undefined)
      assert.notStrictEqual(product.metadata.published, null)
    })
  })
})
