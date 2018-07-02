/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/administrator/subscriptions/plan-invoices', () => {
  describe('PlanInvoices#GET', () => {
    it('should limit invoices on plan to one page', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan1 = await TestHelper.createPlan(administrator, {productid: product.id, published: true})
      const plan2 = await TestHelper.createPlan(administrator, {productid: product.id, published: true})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      const subscription1 = await TestHelper.createSubscription(user, plan1.id)
      await TestHelper.waitForWebhooks(2)
      const subscription2 = await TestHelper.createSubscription(user, plan2.id)
      await TestHelper.waitForWebhooks(4)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/plan-invoices?planid=${user.plan.id}`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      req.plan = administrator.plan
      const subscriptions = await req.route.api.get(req)
      assert.equal(subscriptions.length, global.PAGE_SIZE)
      assert.equal(subscriptions[0].amount, plan2.amount)
      assert.equal(subscriptions[0].subscription, subscription2.id)
      assert.equal(subscriptions[1].amount, plan1.amount)
      assert.equal(subscriptions[1].subscription, subscription1.id)
    })
  })
})
