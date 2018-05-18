/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/administrator/subscriptions/charges', () => {
  describe('Charges#GET', () => {
    it('should filter by customerid', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true})
      const plan1 = administrator.plan
      await TestHelper.createPlan(administrator, {published: true})
      const plan2 = administrator.plan
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, plan1.id)
      const invoice1 = user.invoice
      const user2 = await TestHelper.createUser()
      await TestHelper.createSubscription(user2, plan2.id)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/charges?customerid=${user.customer.id}`, 'GET')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
      const charges = await req.route.api.get(req)
      assert.equal(charges.length, 1)
      assert.equal(charges[0].amount, plan1.amount)
      assert.equal(charges[0].invoice, invoice1.id)
    })

    it('should return charge list', async () => {
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
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/charges`, 'GET')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
      const charges = await req.route.api.get(req)
      assert.equal(charges.length >= 2, true)
      assert.equal(charges[0].amount, plan2.amount)
      assert.equal(charges[0].invoice, invoice2.id)
      assert.equal(charges[1].amount, plan1.amount)
      assert.equal(charges[1].invoice, invoice1.id)
    })
  })
})
