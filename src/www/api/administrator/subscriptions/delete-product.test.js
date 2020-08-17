/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/administrator/subscriptions/delete-product', () => {
  describe('exceptions', () => {
    describe('invalid-productid', () => {
      it('missing querystring productid', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/subscriptions/delete-product')
        req.account = administrator.account
        req.session = administrator.session
        let errorMessage
        try {
          await req.delete()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-productid')
      })

      it('invalid querystring productid', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/subscriptions/delete-product?productid=invalid')
        req.account = administrator.account
        req.session = administrator.session
        let errorMessage
        try {
          await req.delete()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-productid')
      })
    })
  })

  describe('returns', () => {
    it('boolean', async () => {
      const administrator = await TestHelper.createOwner()
      await TestHelper.createProduct(administrator, {
        published: 'true'
      })
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/delete-product?productid=${administrator.product.id}`)
      req.account = administrator.account
      req.session = administrator.session
      req.filename = __filename
      req.saveResponse = true
      const deleted = await req.delete()
      assert.strictEqual(deleted, true)
    })
  })
})
