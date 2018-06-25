/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/user/subscriptions/card-invoices', () => {
  describe('CardInvoices#GET', () => {
    it('should return list of invoices on card', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan1 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 10000})
      const plan2 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 20000})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, plan1.id)
      const invoice1 = user.invoice
      await TestHelper.createSubscription(user, plan2.id)
      const invoice2 = user.invoice
      const req = TestHelper.createRequest(`/api/user/subscriptions/card-invoices?cardid=${user.card.id}`, 'GET')
      req.account = user.account
      req.session = user.session
      const invoices = await req.route.api.get(req)
      assert.equal(invoices.length >= 2, true)
      assert.equal(invoices[0].amount, plan2.amount)
      assert.equal(invoices[0].invoice, invoice2.id)
      assert.equal(invoices[1].amount, plan1.amount)
      assert.equal(invoices[1].invoice, invoice1.id)
    })
  })
})
