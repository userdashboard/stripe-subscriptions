/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/administrator/subscriptions/product-invoices', () => {
  describe('ProductInvoices#GET', () => {
    it('should limit invoices on product to one page', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan1 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 1000})
      const plan2 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 2000})
      const plan3 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 3000})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, plan1.id)
      await TestHelper.waitForWebhooks(2)
      const user2 = await TestHelper.createUser()
      await TestHelper.createCustomer(user2)
      await TestHelper.createCard(user2)
      await TestHelper.createSubscription(user2, plan2.id)
      await TestHelper.waitForWebhooks(4)
      const invoice2 = await TestHelper.loadInvoice(user2, user2.subscription.id)
      const user3 = await TestHelper.createUser()
      await TestHelper.createCustomer(user3)
      await TestHelper.createCard(user3)
      await TestHelper.createSubscription(user3, plan3.id)
      await TestHelper.waitForWebhooks(6)
      const invoice3 = await TestHelper.loadInvoice(user3, user3.subscription.id)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/product-invoices?productid=${product.id}`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      const invoices = await req.route.api.get(req)
      assert.equal(invoices.length, 2)
      assert.equal(invoices[0].id, invoice3.id)
      assert.equal(invoices[1].id, invoice2.id)
    })
  })
})
