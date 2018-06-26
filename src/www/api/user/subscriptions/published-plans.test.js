/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/user/subscriptions/published-plans', () => {
  describe('PublishedPlans#GET', () => {
    it('should not require account', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true})
      const req = TestHelper.createRequest(`/api/user/subscriptions/published-plans`, 'GET')
      const plans = await req.route.api.get(req)
      assert.equal(plans.length, global.PAGE_SIZE)
    })

    it('should exclude never published plans', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator)
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, unpublished: true})
      const plan1 = administrator.plan
      await TestHelper.createPlan(administrator, {productid: product.id, published: true})
      const plan2 = administrator.plan
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/subscriptions/published-plans`, 'GET')
      req.account = user.account
      req.session = user.session
      const plans = await req.route.api.get(req)
      assert.equal(true, plans.length >= 1)
      assert.equal(plans[0].id, plan2.id)
      if (plans.length > 1) {
        for (const plan of plans) {
          assert.notEqual(plan.id, plan1.id)
        }
      }
    })

    it('should exclude unpublished plan', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true})
      const plan1 = administrator.plan
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, unpublished: true})
      const plan2 = administrator.plan
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/subscriptions/published-plans`, 'GET')
      req.account = user.account
      req.session = user.session
      const plans = await req.route.api.get(req)
      assert.equal(true, plans.length >= 1)
      assert.equal(plans[0].id, plan1.id)
      if (plans.length > 1) {
        for (const plan of plans) {
          assert.notEqual(plan.id, plan2.id)
        }
      }
    })

    it('should return plan list', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true})
      const plan1 = administrator.plan
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, unpublished: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true})
      const plan3 = administrator.plan
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/subscriptions/published-plans`, 'GET')
      req.account = user.account
      req.session = user.session
      const plans = await req.route.api.get(req)
      assert.equal(true, plans.length >= 2)
      assert.equal(plans[0].id, plan3.id)
      assert.equal(plans[1].id, plan1.id)
    })
  })
})
