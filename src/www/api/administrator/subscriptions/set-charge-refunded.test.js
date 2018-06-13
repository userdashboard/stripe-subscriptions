/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe(`/api/administrator/subscriptions/set-charge-refunded`, () => {
  describe('SetChargeRefunded#PATCH', () => {
    it('should reject invalid charge', async () => {
      const administrator = await TestHelper.createAdministrator()
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/set-charge-refunded?chargeid=invalid`, 'PATCH')
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        amount: 1000
      }
      let errorMessage
      try {
        await req.route.api.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-chargeid')
    })

    it('should require amount', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true}, {}, 10000, 0)
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, administrator.plan.id)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/set-charge-refunded?chargeid=${user.charge.id}`, 'PATCH')
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        amount: null
      }
      let errorMessage
      try {
        await req.route.api.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-amount')
    })

    it('should reject negative amount', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true}, {}, 10000, 0)
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, administrator.plan.id)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/set-charge-refunded?chargeid=${user.charge.id}`, 'PATCH')
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        amount: -100
      }
      let errorMessage
      try {
        await req.route.api.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-amount')
    })

    it('should reject amount higher than charge', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true}, {}, 10000, 0)
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, administrator.plan.id)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/set-charge-refunded?chargeid=${user.charge.id}`, 'PATCH')
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        amount: 10000 * 2
      }
      let errorMessage
      try {
        await req.route.api.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-amount')
    })

    it('should create authorized refund', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true}, {}, 10000, 0)
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, administrator.plan.id)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/set-charge-refunded?chargeid=${user.charge.id}`, 'PATCH')
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        amount: 10000
      }
      await req.route.api.patch(req)
      await TestHelper.completeAuthorization(req)
      const refund = await req.route.api.patch(req)
      assert.notEqual(null, refund)
    })
  })
})
