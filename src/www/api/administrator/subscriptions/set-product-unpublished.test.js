/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/administrator/subscriptions/set-product-unpublished', () => {
  describe('exceptions', () => {
    describe('invalid-productid', () => {
      it('missing querystring productid', async () => {
        const administrator = await TestHelper.createOwner()
        await TestHelper.createProduct(administrator)
        const req = TestHelper.createRequest('/api/administrator/subscriptions/set-product-unpublished')
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
        await TestHelper.createProduct(administrator)
        const req = TestHelper.createRequest('/api/administrator/subscriptions/set-product-unpublished?productid=invalid')
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
      it('ineligible querystring product is not published', async () => {
        const administrator = await TestHelper.createOwner()
        await TestHelper.createProduct(administrator, {})
        const req = TestHelper.createRequest(`/api/administrator/subscriptions/set-product-unpublished?productid=${administrator.product.id}`)
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

      it('ineligible querystring product is already unpublished', async () => {
        const administrator = await TestHelper.createOwner()
        await TestHelper.createProduct(administrator, {
          published: 'true',
          unpublished: 'true'
        })
        const req = TestHelper.createRequest(`/api/administrator/subscriptions/set-product-unpublished?productid=${administrator.product.id}`)
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
      await TestHelper.createProduct(administrator, {
        published: 'true'
      })
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/set-product-unpublished?productid=${administrator.product.id}`)
      req.account = administrator.account
      req.session = administrator.session
      req.filename = __filename
      req.saveResponse = true
      const plan = await req.patch()
      assert.notStrictEqual(plan.metadata.unpublished, undefined)
      assert.notStrictEqual(plan.metadata.unpublished, null)
    })
  })
})
