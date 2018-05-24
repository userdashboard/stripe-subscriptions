/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/administrator/subscriptions/refund', () => {
  describe('Refund#GET', () => {
    it('should reject invalid refund', async () => {
      const administrator = await TestHelper.createAdministrator()
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/refund?refundid=invalid`, 'GET')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
      let errorMessage
      try {
        await req.route.api.get(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-refundid')
    })

    it('should return refund data', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true})
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, administrator.plan.id)
      await TestHelper.createRefund(user, user.subscription.id)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/refund?refundid=${user.refund.id}`, 'GET')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
      const refund = await req.route.api.get(req)
      assert.equal(refund.id, user.refund.id)
    })
  })
})
