/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/administrator/subscriptions/customer', () => {
  describe('Customer#GET', () => {
    it('should reject invalid customer', async () => {
      const administrator = await TestHelper.createAdministrator()
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/customer?customerid=invalid`, 'GET')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
      let errorMessage
      try {
        await req.route.api.get(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-customerid')
    })

    it('should return customer data', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user, true)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/customer?customerid=${user.customer.id}`, 'GET')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
      const customer = await req.route.api.get(req)
      assert.equal(customer.id, user.customer.id)
    })
  })
})
