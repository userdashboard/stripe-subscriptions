/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/user/subscriptions/charges', () => {
  describe('Charges#GET', () => {
    it('should limit charges to one page', async () => {
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
      const invoice2 = await TestHelper.loadInvoice(user, user.subscription.id)
      await TestHelper.createSubscription(user, plan3.id)
      await TestHelper.waitForWebhooks(6)
      const invoice3 = await TestHelper.loadInvoice(user, user.subscription.id)
      const req = TestHelper.createRequest(`/api/user/subscriptions/charges?customerid=${user.customer.id}`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const charges = await req.route.api.get(req)
      assert.equal(charges.length, 2)
      assert.equal(charges[0].invoice, invoice3.id)
      assert.equal(charges[1].invoice, invoice2.id)
    })
  })
})
