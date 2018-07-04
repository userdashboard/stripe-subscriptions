/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/administrator/subscriptions/plans', () => {
  describe('Plans#GET', () => {
    it('should limit plans to one page', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, unpublished: true})
      const plan3 = await TestHelper.createPlan(administrator, {productid: product.id, published: true})
      const plan4 = await TestHelper.createPlan(administrator, {productid: product.id, published: true})
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/plans`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      const plans = await req.route.api.get(req)
      assert.equal(plans.length, 2)
      assert.equal(plans[0].id, plan4.id)
      assert.equal(plans[1].id, plan3.id)
    })
  })
})
