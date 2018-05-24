/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe(`/api/administrator/subscriptions/publish-product`, () => {
  describe('PublishProduct#PATCH', () => {
    it('should reject invalid productid', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createProduct(administrator)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/publish-product?productid=invalid`, 'PATCH')
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

    it('should reject published product', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createProduct(administrator, { published: true })
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/publish-product?productid=${administrator.product.id}`, 'PATCH')
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

    it('should publish product', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createProduct(administrator)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/publish-product?productid=${administrator.product.id}`, 'PATCH')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
      await req.route.api.patch(req)
      await TestHelper.completeAuthorization(req)
      await req.route.api.patch(req)
      assert.equal(req.success, true)
    })
  })
})
