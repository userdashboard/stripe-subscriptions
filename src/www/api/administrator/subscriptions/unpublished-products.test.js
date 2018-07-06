/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/administrator/subscriptions/unpublished-products', () => {
  describe('UnpublishedProducts#GET', () => {
    it('should limit unpublished products to one page', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createProduct(administrator, {published: true, unpublished: true})
      const product2 = await TestHelper.createProduct(administrator, {published: true, unpublished: true})
      const product3 = await TestHelper.createProduct(administrator, {published: true, unpublished: true})
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/unpublished-products`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      const products = await req.route.api.get(req)
      assert.equal(products.length, 2)
      assert.equal(products[0].id, product3.id)
      assert.equal(products[1].id, product2.id)
    })
  })
})
