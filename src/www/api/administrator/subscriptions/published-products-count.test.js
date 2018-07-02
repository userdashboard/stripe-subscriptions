/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/administrator/subscriptions/published-products-count', async () => {
  describe('PublishedProductsCount#GET', () => {
    it('should count all published products', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createProduct(administrator, {published: true, unpublished: true})
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/published-products-count`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      const result = await req.route.api.get(req)
      assert.equal(result, 3)
    })
  })
})
