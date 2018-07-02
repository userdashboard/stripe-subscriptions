/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/administrator/subscriptions/plan', () => {
  describe('Plan#GET', () => {
    it('should return plan data', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 1000})
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/plan?planid=${administrator.plan.id}`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      const plan = await req.route.api.get(req)
      assert.equal(plan.id, administrator.plan.id)
    })
  })
})
