/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe(`/api/user/subscriptions/set-charge-refunded`, () => {
  describe('SetChargeRefunded#PATCH', () => {
    it('should reject invalid charge', async () => {
      const administrator = await TestHelper.createAdministrator()
      const req = TestHelper.createRequest(`/api/user/subscriptions/set-charge-refunded?chargeid=invalid`, 'PATCH')
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        amount: 100
      }
      let errorMessage
      try {
        await req.route.api.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-chargeid')
    })

    it('should reject other account\'s refund', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true})
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, administrator.plan.id)
      await TestHelper.createRefund(user, user.subscription.id)
      const user2 = await TestHelper.createUser()
      await TestHelper.createSubscription(user2, administrator.plan.id)
      const req = TestHelper.createRequest(`/api/user/subscriptions/set-charge-refunded?chargeid=${user.charge.id}`, 'GET')
      req.account = user2.account
      req.session = user2.session
      req.customer = user2.customer
      req.body = {
        amount: user2.charge.amount
      }
      let errorMessage
      try {
        await req.route.api.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-account')
    })

    it('should create refund', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true}, {}, 10000, 0)
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, administrator.plan.id)
      const req = TestHelper.createRequest(`/api/user/subscriptions/set-charge-refunded?chargeid=${user.charge.id}`, 'PATCH')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      req.body = {
        amount: user.charge.amount
      }
      await req.route.api.patch(req)
      await TestHelper.completeAuthorization(req)
      const refund = await req.route.api.patch(req)
      assert.notEqual(null, refund)
    })
  })
})
