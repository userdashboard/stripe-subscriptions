/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/user/subscriptions/published-plans-count', async () => {
  describe('PublishedPlansCount#GET', () => {
    it('should count published plans', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 1000, trial_period_days: 0})
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/subscriptions/published-plans-count`, 'GET')
      req.account = user.account
      req.session = user.session
      const result = await req.route.api.get(req)
      assert.equal(result, 2)
    })
  })
})
