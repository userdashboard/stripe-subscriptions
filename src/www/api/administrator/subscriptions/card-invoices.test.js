/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/administrator/subscriptions/card-invoices', () => {
  describe('CardInvoices#GET', () => {
    it('should limit invoices on card to one page', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan1 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 1000})
      const plan2 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 1000})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, plan1.id)
      const invoiceid1 = await TestHelper.waitForNextItem(`subscription:invoices:${user.subscription.id}`, null)
      await TestHelper.createSubscription(user, plan2.id)
      const invoiceid2 = await TestHelper.waitForNextItem(`subscription:invoices:${user.subscription.id}`, null)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/card-invoices?cardid=${user.card.id}`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      const invoices = await req.route.api.get(req)
      assert.equal(invoices.length, 2)
      assert.equal(invoices[0].id, invoiceid2)
      assert.equal(invoices[1].id, invoiceid1)
    })
  })
})
