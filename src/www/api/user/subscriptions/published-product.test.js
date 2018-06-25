/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/user/subscriptions/published-product', () => {
  describe('PublishedProduct#GET', () => {
    it('should not require account', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createProduct(administrator, {published: true})
      const req = TestHelper.createRequest(`/api/user/subscriptions/published-product?productid=${administrator.product.id}`, 'GET')
      const product = await req.route.api.get(req)
      assert.equal(product.id, administrator.product.id)
    })

    it('should reject never published product', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createProduct(administrator, {})
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/subscriptions/published-product?productid=${administrator.product.id}`, 'GET')
      req.account = user.account
      req.session = user.session
      let errorMessage
      try {
        await req.route.api.get(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-product')
    })

    it('should reject unpublished product', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createProduct(administrator, {published: true, unpublished: true})
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/subscriptions/published-product?productid=${administrator.product.id}`, 'GET')
      req.account = user.account
      req.session = user.session
      let errorMessage
      try {
        await req.route.api.get(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-product')
    })

    it('should return product data', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createProduct(administrator, {published: true})
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/subscriptions/published-product?productid=${administrator.product.id}`, 'GET')
      req.account = user.account
      req.session = user.session
      const product = await req.route.api.get(req)
      assert.equal(product.id, administrator.product.id)
    })
  })
})
