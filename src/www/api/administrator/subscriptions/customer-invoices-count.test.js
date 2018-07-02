/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/administrator/subscriptions/customer-invoices-count', async () => {
  describe('CustomerInvoicesCount#GET', () => {
    it('should count all invoices on customer', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, administrator.plan.id)
      await TestHelper.waitForWebhooks(2)
      await TestHelper.createSubscription(user, administrator.plan.id)
      await TestHelper.waitForWebhooks(4)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/customer-invoices-count?customerid=${user.customer.id}`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      const result = await req.route.api.get(req)
      assert.equal(result, 2)
    })
  })
})
