/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/administrator/subscriptions/unpublished-plans-count', async () => {
  describe('UnpublishedPlansCount#GET', () => {
    it('should count all unpublished plans', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 1000})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, unpublished: true, trial_period_days: 0, amount: 1000})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, unpublished: true, trial_period_days: 0, amount: 1000})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, unpublished: true, trial_period_days: 0, amount: 1000})
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/unpublished-plans-count`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      const result = await req.route.api.get(req)
      assert.equal(result, 3)
    })
  })
})
