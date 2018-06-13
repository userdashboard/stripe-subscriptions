/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe.only('/api/user/subscriptions/card-refunds-count', async () => {
  describe('CardRefundsCount#GET', () => {
    it('should count all refunds on card', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true})
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, administrator.plan.id)
      await TestHelper.createRefund(user, user.subscription.id)
      await TestHelper.createSubscription(user, administrator.plan.id)
      await TestHelper.createRefund(user, user.subscription.id)
      const req = TestHelper.createRequest(`/api/user/subscriptions/card-refunds-count?cardid=${user.card.id}`, 'GET')
      req.account = user.account
      req.session = user.session
      const result = await req.route.api.get(req)
      assert.equal(result, 2)
    })
  })
})
