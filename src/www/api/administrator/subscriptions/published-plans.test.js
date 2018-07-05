/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/administrator/subscriptions/published-plans', () => {
  describe('PublishedPlans#GET', () => {
    it('should limit published plans to one page', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true})
      const plan2 = await TestHelper.createPlan(administrator, {productid: product.id, published: true})
      const plan3 = await TestHelper.createPlan(administrator, {productid: product.id, published: true})
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/published-plans`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      const plans = await req.route.api.get(req)
      assert.equal(plans.length, 2)
      assert.equal(plans[0].id, plan3.id)
      assert.equal(plans[1].id, plan2.id)
    })
  })
})
