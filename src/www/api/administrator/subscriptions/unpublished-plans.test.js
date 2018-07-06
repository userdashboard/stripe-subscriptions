/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/administrator/subscriptions/unpublished-plans', () => {
  describe('UnpublishedPlans#GET', () => {
    it('should limit unpublished plans to one page', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, unpublished: true, trial_period_days: 0, amount: 1000})
      const plan2 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, unpublished: true, trial_period_days: 0, amount: 1000})
      const plan3 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, unpublished: true, trial_period_days: 0, amount: 1000})
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/unpublished-plans`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      const plans = await req.route.api.get(req)
      assert.equal(plans.length, 2)
      assert.equal(plans[0].id, plan3.id)
      assert.equal(plans[1].id, plan2.id)
    })
  })
})
