/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/administrator/subscriptions/card-refunds', () => {
  describe('CardRefunds#GET', () => {
    it('should limit refunds on card to one page', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan1 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 1000})
      const plan2 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 2000})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, plan1.id)
      await TestHelper.waitForWebhooks(2)
      await TestHelper.loadCharge(user, user.subscription.id)
      await TestHelper.createRefund(user, user.charge)
      await TestHelper.waitForWebhooks(3)
      await TestHelper.createSubscription(user, plan2.id)
      await TestHelper.waitForWebhooks(5)
      await TestHelper.loadCharge(user, user.subscription.id)
      const refund2 = await TestHelper.createRefund(user, user.charge)
      await TestHelper.waitForWebhooks(6)
      await TestHelper.createSubscription(user, plan2.id)
      await TestHelper.waitForWebhooks(8)
      await TestHelper.loadCharge(user, user.subscription.id)
      const refund3 = await TestHelper.createRefund(user, user.charge)
      await TestHelper.waitForWebhooks(9)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/card-refunds?cardid=${user.card.id}`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      const refunds = await req.route.api.get(req)
      assert.equal(refunds.length, 2)
      assert.equal(refunds[0].id, refund3.id)
      assert.equal(refunds[1].id, refund2.id)
    })
  })
})
