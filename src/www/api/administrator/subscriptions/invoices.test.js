/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/administrator/subscriptions/invoices', () => {
  describe('Invoices#GET', () => {
    it('should limit invoices to one page', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan1 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 1000})
      const plan2 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 2000})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      const subscription1 = await TestHelper.createSubscription(user, plan1.id)
      await TestHelper.waitForWebhooks(2)
      const subscription2 = await TestHelper.createSubscription(user, plan2.id)
      await TestHelper.waitForWebhooks(4)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/invoices`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      const invoices = await req.route.api.get(req)
      assert.equal(invoices.length, global.PAGE_SIZE)
      assert.equal(invoices[0].subscription, subscription2.id)
      assert.equal(invoices[1].subscription, subscription1.id)
    })
  })
})
