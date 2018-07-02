/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/user/subscriptions/upcoming-invoices', () => {
  describe('Upcominginvoices#GET', () => {
    it('should return upcoming invoice for each subscription', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan1 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 10000})
      const plan2 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 20000})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, plan1.id)
      await TestHelper.createSubscription(user, plan2.id)
      const req = TestHelper.createRequest(`/api/user/subscriptions/upcoming-invoices?customerid=${user.customer.id}`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const invoices = await req.route.api.get(req)
      assert.equal(invoices[0].total, plan2.amount)
      assert.equal(invoices[1].total, plan1.amount)
    })
  })
})
