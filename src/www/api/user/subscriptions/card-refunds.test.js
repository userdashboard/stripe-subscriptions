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
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, plan1.id)
      const refund1 = user.refund
      await TestHelper.createSubscription(user, plan2.id)
      const refund2 = user.refund
      const req = TestHelper.createRequest(`/api/user/subscriptions/card-refunds?cardid=${user.card.id}`, 'GET')
      req.account = user.account
      req.session = user.session
      await TestHelper.waitForWebhooks()
      const refunds = await req.route.api.get(req)
      assert.equal(refunds.length, global.PAGE_SIZE)
      assert.equal(refunds[0].amount, plan2.amount)
      assert.equal(refunds[0].refund, refund2.id)
      assert.equal(refunds[1].amount, plan1.amount)
      assert.equal(refunds[1].refund, refund1.id)
    })
  })
})
