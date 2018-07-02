/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/user/subscriptions/card-refunds', () => {
  describe('CardRefunds#GET', () => {
    it('should limit refunds on card to one page', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan1 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 10000})
      const plan2 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 20000})
      const plan3 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 30000})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, plan2.id)
      await TestHelper.waitForWebhooks(2)
      await TestHelper.changeSubscription(user, plan1.id)
      await TestHelper.waitForWebhooks(4)
      const refund1 = await TestHelper.createRefund(user, user.charge)
      await TestHelper.waitForWebhooks(5)
      await TestHelper.createSubscription(user, plan2.id)
      await TestHelper.waitForWebhooks(7)
      await TestHelper.changeSubscription(user, plan3.id)
      await TestHelper.waitForWebhooks(9)
      const refund2 = await TestHelper.createRefund(user, user.charge)
      await TestHelper.waitForWebhooks(10)
      const req = TestHelper.createRequest(`/api/user/subscriptions/card-refunds?cardid=${user.card.id}`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const refunds = await req.route.api.get(req)
      assert.equal(refunds.length, 2)
      assert.equal(refunds[0].id, refund2.id)
      assert.equal(refunds[1].id, refund1.id)
    })
  })
})
