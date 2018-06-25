/* eslint-env mocha */
const assert = require('assert')
const BindCustomer = require('./bind-customer.js')
const TestHelper = require('../../test-helper.js')

describe('server/bind-customer', async () => {
  describe('BindCustomer#AFTER', () => {
    it('should bind existing customer data to req', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      const req = TestHelper.createRequest(`/account/change-username`, 'GET')
      req.account = user.account
      req.session = user.session
      await BindCustomer.after(req)
      assert.equal(req.customer.id, user.customer.id)
    })

    it('should bind new customer data to req', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/account/change-username`, 'GET')
      req.account = user.account
      req.session = user.session
      await BindCustomer.after(req)
      assert.equal(req.customer.id, req.account.customerid)
    })
  })
})
