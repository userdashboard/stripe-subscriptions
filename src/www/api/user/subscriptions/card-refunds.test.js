/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/user/subscriptions/card-refunds', () => {
  describe('CardRefunds#GET', () => {
    it('should return list of refunds on card', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true})
      const plan1 = administrator.plan
      await TestHelper.createPlan(administrator, {published: true})
      const plan2 = administrator.plan
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, plan1.id)
      const refund1 = user.refund
      await TestHelper.createSubscription(user, plan2.id)
      const refund2 = user.refund
      const req = TestHelper.createRequest(`/api/user/subscriptions/card-refunds?cardid=${user.card.id}`, 'GET')
      req.account = user.account
      req.session = user.session
      const refunds = await req.route.api.get(req)
      assert.equal(refunds.length >= 2, true)
      assert.equal(refunds[0].amount, plan2.amount)
      assert.equal(refunds[0].refund, refund2.id)
      assert.equal(refunds[1].amount, plan1.amount)
      assert.equal(refunds[1].refund, refund1.id)
    })
  })
})
