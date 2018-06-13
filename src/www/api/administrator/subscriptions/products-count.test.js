/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/administrator/subscriptions/products-count', async () => {
  describe('ProductsCount#GET', () => {
    it('should count products', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createProduct(administrator, {})
      const req = TestHelper.createRequest('/api/administrator/subscriptions/products-count', 'GET')
      req.account = administrator.account
      req.session = administrator.session
      const result = await req.route.api.get(req)
      assert.equal(result, 3)
    })
  })
})
