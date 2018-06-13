/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe.only('/api/administrator/subscriptions/product-charges-count', async () => {
  describe('ProductChargesCount#GET', () => {
    it('should count all charges on product', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true})
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, administrator.plan.id)
      await TestHelper.createSubscription(user, administrator.plan.id)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/product-charges-count?productid=${administrator.product.id}`, 'GET')
      req.account = administrator.account
      req.session = administrator.session
      const result = await req.route.api.get(req)
      assert.equal(result, 2)
    })
  })
})
