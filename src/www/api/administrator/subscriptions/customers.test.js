/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/administrator/subscriptions/customers', () => {
  describe('Customers#GET', () => {
    it('should return customer list', async () => {
      const administrator = await TestHelper.createAdministrator()
      const user1 = await TestHelper.createUser()
      await TestHelper.createCustomer(user1)
      const user2 = await TestHelper.createUser()
      await TestHelper.createCustomer(user2)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/customers`, 'GET')
      req.account = administrator.account
      req.session = administrator.session
      const customers = await req.route.api.get(req)
      assert.equal(customers.length >= 2, true)
      assert.equal(customers[0].id, user2.customer.id)
      assert.equal(customers[1].id, user1.customer.id)
    })
  })
})
