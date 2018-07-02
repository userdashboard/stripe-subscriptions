/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/user/subscriptions/published-products', () => {
  describe('PublishedProducts#GET', () => {
    it('should not require account', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createProduct(administrator, {published: true})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      const req = TestHelper.createRequest(`/api/user/subscriptions/published-products`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const products = await req.route.api.get(req)
      assert.equal(products.length, 1)
    })

    it('should exclude never published products', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createProduct(administrator)
      const product2 = await TestHelper.createProduct(administrator, {published: true})
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/subscriptions/published-products`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const products = await req.route.api.get(req)
      assert.equal(products.length, 1)
      assert.equal(products[0].id, product2.id)
    })

    it('should exclude unpublished product', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product1 = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createProduct(administrator, {published: true, unpublished: true})
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/subscriptions/published-products`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const products = await req.route.api.get(req)
      assert.equal(products.length, 1)
      assert.equal(products[0].id, product1.id)
    })

    it('should limit product list to one page', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createProduct(administrator, {published: true})
      const product2 = await TestHelper.createProduct(administrator, {published: true})
      const product3 = await TestHelper.createProduct(administrator, {published: true})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      const req = TestHelper.createRequest(`/api/user/subscriptions/published-products`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const products = await req.route.api.get(req)
      assert.equal(products.length, 2)
      assert.equal(products[0].id, product3.id)
      assert.equal(products[1].id, product2.id)
    })
  })
})
