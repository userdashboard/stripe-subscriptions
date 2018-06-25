/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/administrator/subscriptions/unpublished-products', () => {
  describe('UnpublishedProducts#GET', () => {
    it('should return list of unpublished products', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product1 = await TestHelper.createProduct(administrator, {published: true, unpublished: true})
      const product2 = await TestHelper.createProduct(administrator, {published: true, unpublished: true})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/unpublished-products`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      req.product = administrator.product
      const products = await req.route.api.get(req)
      assert.equal(products.length >= 2, true)
      assert.equal(products[0].id, product2.id)
      assert.equal(products[1].id, product1.id)
    })
  })
})
