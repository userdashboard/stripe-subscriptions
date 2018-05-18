/* eslint-env mocha */
const assert = require('assert')
const ProxyAccount = require('./x-customer-header.js')
const TestHelper = require('../test-helper.js')

describe(`proxy/x-customer-header`, () => {
  describe('Customer#AFTER', () => {
    it('should set customer data in header', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      const req = TestHelper.createRequest(`/account/change-username`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      await ProxyAccount.after(req)
      assert.notEqual(null, req.headers['x-customer'])
    })
  })
})
