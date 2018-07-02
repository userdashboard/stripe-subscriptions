/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/user/subscriptions/card-invoices', () => {
  describe('Cardinvoices#GET', () => {
    it('should limit invoices on card to one page', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan1 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 10000})
      const plan2 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 20000})
      const plan3 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 30000})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, plan1.id)
      await TestHelper.waitForWebhooks(2)
      await TestHelper.createSubscription(user, plan2.id)
      await TestHelper.waitForWebhooks(4)
      await TestHelper.createSubscription(user, plan3.id)
      await TestHelper.waitForWebhooks(6)
      const req = TestHelper.createRequest(`/api/user/subscriptions/card-invoices?cardid=${user.card.id}`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const invoices = await req.route.api.get(req)
      assert.equal(invoices.length, 2)
      assert.equal(invoices[0].lines.data[0].plan.id, plan3.id)
      assert.equal(invoices[1].lines.data[0].plan.id, plan2.id)
    })
  })
})
