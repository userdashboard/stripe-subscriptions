/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/administrator/subscriptions/customers-count', async () => {
  describe('CustomersCount#GET', () => {
    it('should count customers', async () => {
      const administrator = await TestHelper.createAdministrator()
      const user1 = await TestHelper.createUser()
      await TestHelper.createCustomer(user1)
      const user2 = await TestHelper.createUser()
      await TestHelper.createCustomer(user2)
      const req = TestHelper.createRequest('/api/administrator/subscriptions/customers-count', 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      const result = await req.route.api.get(req)
      assert.equal(result, 2)
    })
  })
})
