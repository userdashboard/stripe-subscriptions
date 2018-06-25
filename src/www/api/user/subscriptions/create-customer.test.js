/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe(`/api/user/subscriptions/create-customer`, () => {
  describe('CreateCustomer#POST', () => {
    it('should reject other accountid', async () => {
      const user = await TestHelper.createUser()
      const user2 = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/subscriptions/create-customer?accountid=${user2.account.accountid}`, 'GET')
      req.account = user.account
      req.session = user.session
      let errorMessage
      try {
        await req.route.api.post(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-account')
    })

    it('should reject existing customer', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      const req = TestHelper.createRequest(`/api/user/subscriptions/create-customer?accountid=${user.account.accountid}`, 'POST')
      req.account = user.account
      req.session = user.session
      await req.route.api.post(req)
      let errorMessage
      try {
        await req.route.api.post(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-account')
    })

    it('should create customer', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/subscriptions/create-customer?accountid=${user.account.accountid}`, 'POST')
      req.account = user.account
      req.session = user.session
      await req.route.api.post(req)
      assert.notEqual(null, req.account.customerid)
    })
  })
})
