/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/user/subscriptions/refund', () => {
  describe('Refund#GET', () => {
    it('should reject invalid refund', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      const req = TestHelper.createRequest(`/api/user/subscriptions/refund?refundid=invalid`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      let errorMessage
      try {
        await req.route.api.get(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-refundid')
    })

    it('should reject other account\'s refund', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true})
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, administrator.plan.id)
      await TestHelper.createRefund(user, user.subscription.id)
      const user2 = await TestHelper.createUser()
      await TestHelper.createSubscription(user2, administrator.plan.id)
      const req = TestHelper.createRequest(`/api/user/subscriptions/refund?refundid=${user.refund.id}`, 'GET')
      req.account = user2.account
      req.session = user2.session
      req.customer = user2.customer
      let errorMessage
      try {
        await req.route.api.get(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-account')
    })

    it('should return refund data', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createProduct(administrator, {published: true})
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/subscriptions/product?productid=${administrator.product.id}`, 'GET')
      req.account = user.account
      req.session = user.session
      const product = await req.route.api.get(req)
      assert.equal(product.id, administrator.product.id)
    })
  })
})
