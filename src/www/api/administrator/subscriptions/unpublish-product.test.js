/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe(`/api/administrator/subscriptions/set-product-unpublished`, () => {
  describe('SetProductUnpublished#PATCH', () => {
    it('should reject invalid productid', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createProduct(administrator)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/set-product-unpublished?productid=invalid`, 'PATCH')
      req.account = administrator.account
      req.session = administrator.session
      let errorMessage
      try {
        await req.route.api.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-productid')
    })

    it('should reject never published product', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createProduct(administrator, { })
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/set-product-unpublished?productid=${administrator.product.id}`, 'PATCH')
      req.account = administrator.account
      req.session = administrator.session
      let errorMessage
      try {
        await req.route.api.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-product')
    })

    it('should reject unpublished product', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createProduct(administrator, { published: true, unpublished: true })
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/set-product-unpublished?productid=${administrator.product.id}`, 'PATCH')
      req.account = administrator.account
      req.session = administrator.session
      let errorMessage
      try {
        await req.route.api.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-product')
    })

    it('should unpublish product', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createProduct(administrator, { published: true })
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/set-product-unpublished?productid=${administrator.product.id}`, 'PATCH')
      req.account = administrator.account
      req.session = administrator.session
      await req.route.api.patch(req)
      await TestHelper.completeAuthorization(req)
      await req.route.api.patch(req)
      assert.equal(req.success, true)
    })
  })
})
