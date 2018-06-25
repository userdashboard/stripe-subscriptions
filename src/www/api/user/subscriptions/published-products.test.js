/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/user/subscriptions/published-products', () => {
  describe('PublishedProducts#GET', () => {
    it('should not require account', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createProduct(administrator, {published: true})
      const req = TestHelper.createRequest(`/api/user/subscriptions/published-products`, 'GET')
      const products = await req.route.api.get(req)
      assert.equal(products.length >= 2, true)
    })

    it('should exclude never published products', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product1 = await TestHelper.createProduct(administrator)
      const product2 = await TestHelper.createProduct(administrator, {published: true})
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/subscriptions/published-products`, 'GET')
      req.account = user.account
      req.session = user.session
      const products = await req.route.api.get(req)
      assert.equal(true, products.length >= 1)
      assert.equal(products[0].id, product2.id)
      if (products.length > 1) {
        for (const product of products) {
          assert.notEqual(product.id, product1.id)
        }
      }
    })

    it('should exclude unpublished product', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createProduct(administrator, {published: true})
      const product1 = administrator.product
      await TestHelper.createProduct(administrator, {published: true, unpublished: true})
      const product2 = administrator.product
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/subscriptions/published-products`, 'GET')
      req.account = user.account
      req.session = user.session
      const products = await req.route.api.get(req)
      assert.equal(true, products.length >= 1)
      assert.equal(products[0].id, product1.id)
      if (products.length > 1) {
        for (const product of products) {
          assert.notEqual(product.id, product2.id)
        }
      }
    })

    it('should return product list', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createProduct(administrator, {published: true})
      const product1 = administrator.product
      await TestHelper.createProduct(administrator, {published: true, unpublished: true})
      await TestHelper.createProduct(administrator, {published: true})
      const product3 = administrator.product
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/subscriptions/published-products`, 'GET')
      req.account = user.account
      req.session = user.session
      const products = await req.route.api.get(req)
      assert.equal(true, products.length >= 2)
      assert.equal(products[0].id, product3.id)
      assert.equal(products[1].id, product1.id)
    })
  })
})
