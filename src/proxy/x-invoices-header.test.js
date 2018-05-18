/* eslint-env mocha */
const assert = require('assert')
const InvoiceHeader = require('./x-invoices-header.js')
const TestHelper = require('../test-helper.js')

describe(`proxy/x-invoices-header`, () => {
  describe('Invoices#AFTER', () => {
    it('should set invoice data in header', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true}, {}, 1000, 0)
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, administrator.plan.id)
      const req = TestHelper.createRequest(`/account/change-username`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      await InvoiceHeader.after(req)
      assert.notEqual(null, req.headers['x-invoices'])
      const invoices = JSON.parse(req.headers['x-invoices'])
      assert.equal(invoices.length, 1)
      assert.equal(invoices[0].id, user.invoice.id)
    })
  })
})
