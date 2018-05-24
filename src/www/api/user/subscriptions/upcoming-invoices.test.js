/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/user/subscriptions/upcoming-invoices', () => {
  describe('UpcomingInvoices#GET', () => {
    it('should return upcoming invoice for each subscription', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true}, {}, 10000, 0)
      const plan1 = administrator.plan
      await TestHelper.createPlan(administrator, {published: true}, {}, 20000, 0)
      const plan2 = administrator.plan
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, plan1.id)
      await TestHelper.createSubscription(user, plan2.id)
      const req = TestHelper.createRequest(`/api/user/subscriptions/upcoming-invoices`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const invoices = await req.route.api.get(req)
      assert.equal(invoices[0].total, plan2.amount)
      assert.equal(invoices[1].total, plan1.amount)
    })
  })
})
