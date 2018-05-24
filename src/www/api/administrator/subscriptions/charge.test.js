/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/administrator/subscriptions/charge', () => {
  describe('Charge#GET', () => {
    it('should reject invalid charge', async () => {
      const administrator = await TestHelper.createAdministrator()
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/charge?chargeid=invalid`, 'GET')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
      let errorMessage
      try {
        await req.route.api.get(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-chargeid')
    })

    it('should return charge data', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true})
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, administrator.plan.id)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/charge?chargeid=${user.charge.id}`, 'GET')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
      const charge = await req.route.api.get(req)
      assert.equal(charge.id, user.charge.id)
    })
  })
})
