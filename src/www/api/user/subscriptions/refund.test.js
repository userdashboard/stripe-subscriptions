/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

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
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 10000})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, administrator.plan.id)
      await TestHelper.createRefund(user, user.subscription.id)
      const user2 = await TestHelper.createUser()
      await TestHelper.createCustomer(user2)
      await TestHelper.createCard(user2)
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
      const product1 = await TestHelper.createProduct(administrator, {published: true})
      const product2 = await TestHelper.createProduct(administrator, {published: true})
      const plan1 = await TestHelper.createPlan(administrator, {published: true, trial_period_days: 0, amount: 10000, productid: product1.id})
      const plan2 = await TestHelper.createPlan(administrator, {published: true, trial_period_days: 0, amount: 20000, productid: product2.id})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, plan1.id)
      await TestHelper.changeSubscription(user, plan2.id)
      await TestHelper.createRefund(administrator, user.charge)
      const req = TestHelper.createRequest(`/api/user/subscriptions/refund?refundid=${administrator.refund.id}`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const refund = await req.route.api.get(req)
      assert.equal(refund.id, administrator.refund.id)
    })
  })
})
