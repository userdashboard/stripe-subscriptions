/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe(`/api/user/subscriptions/delete-card`, () => {
  describe('DeleteCard#DELETE', () => {
    it('should reject invalid cardid', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/subscriptions/delete-card?cardid=invalid`, 'DELETE')
      req.account = user.account
      req.session = user.session
      try {
        await req.route.api.delete(req)
      } catch (error) {
        assert.equal(error.message, 'invalid-cardid')
      }
    })

    it('should reject other account\'s card', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true})
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, administrator.plan.id)
      const user2 = await TestHelper.createUser()
      await TestHelper.createSubscription(user2, administrator.plan.id)
      const req = TestHelper.createRequest(`/api/user/subscriptions/delete-card?cardid=${user.card.id}`, 'DELETE')
      req.account = user2.account
      req.session = user2.session
      req.customer = user2.customer
      try {
        await req.route.api.delete(req)
      } catch (error) {
        assert.equal(error.message, 'invalid-cardid')
      }
    })

    it('should delete card', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user, true)
      const req = TestHelper.createRequest(`/api/user/subscriptions/delete-card?cardid=${user.card.id}`, 'DELETE')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      await req.route.api.delete(req)
      await TestHelper.completeAuthorization(req)
      await req.route.api.delete(req)
      assert.equal(req.success, true)
    })
  })
})
