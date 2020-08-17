/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/user/subscriptions/published-product', () => {
  describe('exceptions', () => {
    describe('invalid-productid', () => {
      it('missing querystring productid', async () => {
        const req = TestHelper.createRequest('/api/user/subscriptions/published-product')
        let errorMessage
        try {
          await req.get()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-productid')
      })

      it('invalid querystring productid', async () => {
        const req = TestHelper.createRequest('/api/user/subscriptions/published-product?productid=invalid')
        let errorMessage
        try {
          await req.get()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-productid')
      })
    })

    describe('invalid-product', () => {
      it('ineligible querystring product is not published', async () => {
        const administrator = await TestHelper.createOwner()
        await TestHelper.createProduct(administrator, {})
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest(`/api/user/subscriptions/published-product?productid=${administrator.product.id}`)
        req.account = user.account
        req.session = user.session
        let errorMessage
        try {
          await req.get()
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
      await TestHelper.createProduct(administrator, {
        published: 'true'
      })
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/subscriptions/published-product?productid=${administrator.product.id}`)
      req.account = user.account
      req.session = user.session
      req.filename = __filename
      req.saveResponse = true
      const product = await req.get()
      assert.strictEqual(product.id, administrator.product.id)
    })
  })
})
