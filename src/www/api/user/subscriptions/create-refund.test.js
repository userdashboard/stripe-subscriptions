/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe(`/api/user/subscriptions/create-refund`, () => {
  describe('CreateRefund#POST', () => {
    it('should reject invalid charge', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/subscriptions/create-refund?chargeid=invalid`, 'POST')
      req.account = user.account
      req.session = user.session
      req.body = {
        amount: 100
      }
      let errorMessage
      try {
        await req.route.api.post(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-chargeid')
    })

    it('should reject other account\'s charge', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan1 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 10000})
      const plan2 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 20000, interval: 'day'})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, plan1.id)
      const chargeid1 = await TestHelper.waitForNextItem(`subscription:charges:${user.subscription.id}`, null)
      await TestHelper.changeSubscription(user, plan2.id)
      const chargeid2 = await TestHelper.waitForNextItem(`subscription:charges:${user.subscription.id}`, chargeid1)
      const charge = await TestHelper.loadCharge(user, chargeid2)
      const user2 = await TestHelper.createUser()
      await TestHelper.createCustomer(user2)
      const req = TestHelper.createRequest(`/api/user/subscriptions/create-refund?chargeid=${chargeid2}`, 'GET')
      req.account = user2.account
      req.session = user2.session
      req.customer = user2.customer
      req.body = {
        amount: charge.amount
      }
      let errorMessage
      try {
        await req.route.api.post(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-account')
    })

    it('should create refund', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan1 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 10000})
      const plan2 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 20000})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, plan1.id)
      const chargeid1 = await TestHelper.waitForNextItem(`subscription:charges:${user.subscription.id}`, null)
      await TestHelper.changeSubscription(user, plan2.id)
      const chargeid2 = await TestHelper.waitForNextItem(`subscription:charges:${user.subscription.id}`, chargeid1)
      const charge = await TestHelper.loadCharge(user, chargeid2)
      const req = TestHelper.createRequest(`/api/user/subscriptions/create-refund?chargeid=${chargeid2}`, 'POST')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      req.body = {
        amount: charge.amount
      }
      await req.route.api.post(req)
      req.session = await TestHelper.unlockSession(user)
      const refund = await req.route.api.post(req)
      assert.notEqual(null, refund)
    })
  })
})
