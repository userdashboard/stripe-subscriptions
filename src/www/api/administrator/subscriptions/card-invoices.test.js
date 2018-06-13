/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/administrator/subscriptions/card-invoices', () => {
  describe('CardInvoices#GET', () => {
    it('should return list of invoices on card', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true})
      const plan1 = administrator.plan
      await TestHelper.createPlan(administrator, {published: true})
      const plan2 = administrator.plan
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, plan1.id)
      const invoice1 = user.invoice
      await TestHelper.createSubscription(user, plan2.id)
      const invoice2 = user.invoice
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/card-invoices?cardid=${user.card.id}`, 'GET')
      req.account = administrator.account
      req.session = administrator.session
      const invoices = await req.route.api.get(req)
      assert.equal(invoices.length >= 2, true)
      assert.equal(invoices[0].amount, plan2.amount)
      assert.equal(invoices[0].invoice, invoice2.id)
      assert.equal(invoices[1].amount, plan1.amount)
      assert.equal(invoices[1].invoice, invoice1.id)
    })
  })
})
