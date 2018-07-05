/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/administrator/subscriptions/plan-invoices', () => {
  describe('PlanInvoices#GET', () => {
    it('should limit invoices on plan to one page', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 1000})
      const user1 = await TestHelper.createUser()
      await TestHelper.createCustomer(user1)
      await TestHelper.createCard(user1)
      await TestHelper.createSubscription(user1, administrator.plan.id)
      await TestHelper.waitForWebhooks(2)
      const user2 = await TestHelper.createUser()
      await TestHelper.createCustomer(user2)
      await TestHelper.createCard(user2)
      await TestHelper.createSubscription(user2, administrator.plan.id)
      await TestHelper.waitForWebhooks(4)
      const invoice2 = await TestHelper.loadInvoice(user2, user2.subscription.id)
      const user3 = await TestHelper.createUser()
      await TestHelper.createCustomer(user3)
      await TestHelper.createCard(user3)
      await TestHelper.createSubscription(user3, administrator.plan.id)
      await TestHelper.waitForWebhooks(6)
      const invoice3 = await TestHelper.loadInvoice(user3, user3.subscription.id)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/plan-invoices?planid=${administrator.plan.id}`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      const invoices = await req.route.api.get(req)
      assert.equal(invoices.length, 2)
      assert.equal(invoices[0].id, invoice3.id)
      assert.equal(invoices[1].id, invoice2.id)
    })
  })
})
