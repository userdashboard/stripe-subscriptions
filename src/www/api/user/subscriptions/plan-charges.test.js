/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/user/subscriptions/plan-charges', () => {
  describe('PlanCharges#GET', () => {
    it('should limit charges to one page', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 10000})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, administrator.plan.id)
      await TestHelper.waitForWebhooks(2)
      const charge2 = await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, administrator.plan.id)
      await TestHelper.waitForWebhooks(4)
      const charge3 = await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, administrator.plan.id)
      await TestHelper.waitForWebhooks(6)
      const req = TestHelper.createRequest(`/api/user/subscriptions/plan-charges?planid=${administrator.plan.id}`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const charges = await req.route.api.get(req)
      assert.equal(charges.length, 2)
      assert.equal(charges[0].id, charge3.id)
      assert.equal(charges[1].id, charge2.id)
    })

    it('should enforce page size', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 10000})
      global.PAGE_SIZE = 3
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      for (let i = 0, len = global.PAGE_SIZE + 1; i < len; i++) {
        await TestHelper.createCard(user)
        await TestHelper.createSubscription(user, administrator.plan.id)
        await TestHelper.waitForWebhooks(2 * (i + 1))
      }
      const req = TestHelper.createRequest(`/api/user/subscriptions/plan-charges?planid=${administrator.plan.id}`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const chargesNow = await req.route.api.get(req)
      assert.equal(chargesNow.length, global.PAGE_SIZE)
    })

    it('should enforce specified offset', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 10000})
      const offset = 1
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      const charges = [ ]
      for (let i = 0, len = offset + global.PAGE_SIZE + 1; i < len; i++) {
        const charge = await TestHelper.createCard(user)
        await TestHelper.createSubscription(user, administrator.plan.id)
        charges.unshift(charge)
        await TestHelper.waitForWebhooks(2 * (i + 1))
      }
      const req = TestHelper.createRequest(`/api/user/subscriptions/plan-charges?planid=${administrator.plan.id}&offset=${offset}`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const chargesNow = await req.route.api.get(req)
      for (let i = 0, len = global.PAGE_SIZE; i < len; i++) {
        assert.equal(chargesNow[i].id, charges[offset + i].id)
      }
    })
  })
})
