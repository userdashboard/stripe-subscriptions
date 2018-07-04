/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/administrator/subscriptions/plan-charges', () => {
  describe('PlanCharges#GET', () => {
    it('should limit charges on plan to one page', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 1000})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, plan.id)
      await TestHelper.waitForWebhooks(2)
      const user2 = await TestHelper.createUser()
      await TestHelper.createCustomer(user2)
      await TestHelper.createCard(user2)
      await TestHelper.createSubscription(user2, plan.id)
      await TestHelper.waitForWebhooks(4)
      const charge2 = await TestHelper.loadCharge(user2, user2.subscription.id)
      const user3 = await TestHelper.createUser()
      await TestHelper.createCustomer(user3)
      await TestHelper.createCard(user3)
      await TestHelper.createSubscription(user3, plan.id)
      await TestHelper.waitForWebhooks(6)
      const charge3 = await TestHelper.loadCharge(user3, user3.subscription.id)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/plan-charges?planid=${plan.id}`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      req.plan = administrator.plan
      const charges = await req.route.api.get(req)
      assert.equal(charges.length, 2)
      assert.equal(charges[0].id, charge3.id)
      assert.equal(charges[1].id, charge2.id)
    })
  })
})
