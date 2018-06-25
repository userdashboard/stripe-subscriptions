/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/administrator/subscriptions/plans-count', async () => {
  describe('PlansCount#GET', () => {
    it('should count plans', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true})
      await TestHelper.createPlan(administrator, {productid: product.id})
      const req = TestHelper.createRequest('/api/administrator/subscriptions/plans-count', 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      const result = await req.route.api.get(req)
      assert.equal(result, 3)
    })
  })
})
