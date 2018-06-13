/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe.only('/api/user/subscriptions/invoices-count', async () => {
  describe('Invoices#GET', () => {
    it('should count account\'s invoices', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true}, {}, 1000, 0)
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createSubscription(user, user.subscription.id)
      const req = TestHelper.createRequest(`/api/user/subscriptions/invoices-count`, 'GET')
      req.account = user.account
      req.session = user.session
      const result = await req.route.api.get(req)
      assert.equal(result, 2)
    })
  })
})
