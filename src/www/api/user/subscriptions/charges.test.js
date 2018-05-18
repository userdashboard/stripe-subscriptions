/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/user/subscriptions/charges', () => {
  describe('Charges#GET', () => {
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
      const req = TestHelper.createRequest(`/api/user/subscriptions/charges`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const charges = await req.route.api.get(req)
      assert.equal(charges.length, 2)
      assert.equal(charges[0].amount, plan2.amount)
      assert.equal(charges[0].invoice, invoice2.id)
      assert.equal(charges[1].amount, plan1.amount)
      assert.equal(charges[1].invoice, invoice1.id)
    })
  })
})
