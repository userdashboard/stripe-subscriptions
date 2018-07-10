/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/user/subscriptions/product-subscriptions', () => {
  describe('ProductSubscriptions#GET', () => {
    it('should limit subscriptions to one page', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan1 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 10000})
      const plan2 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 20000})
      const plan3 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 30000})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, plan1.id)
      await TestHelper.waitForWebhooks(2)
      const subscription2 = await TestHelper.createSubscription(user, plan2.id)
      await TestHelper.waitForWebhooks(4)
      const subscription3 = await TestHelper.createSubscription(user, plan3.id)
      await TestHelper.waitForWebhooks(6)
      const req = TestHelper.createRequest(`/api/user/subscriptions/product-subscriptions?productid=${product.id}`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const subscriptions = await req.route.api.get(req)
      assert.equal(subscriptions.length, 2)
      assert.equal(subscriptions[0].id, subscription3.id)
      assert.equal(subscriptions[1].id, subscription2.id)
    })

    it('should enforce page size', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      global.PAGE_SIZE = 3
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      for (let i = 0, len = global.PAGE_SIZE + 1; i < len; i++) {
        await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 10000})
        await TestHelper.createSubscription(user, administrator.plan.id)
        await TestHelper.waitForWebhooks(2 * (i + 1))
      }
      const req = TestHelper.createRequest(`/api/user/subscriptions/product-subscriptions?productid=${product.id}`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const subscriptionsNow = await req.route.api.get(req)
      assert.equal(subscriptionsNow.length, global.PAGE_SIZE)
    })

    it('should enforce specified offset', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const offset = 1
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      const subscriptions = []
      for (let i = 0, len = offset + global.PAGE_SIZE + 1; i < len; i++) {
        await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 10000})
        const subscription = await TestHelper.createSubscription(user, administrator.plan.id)
        subscriptions.unshift(subscription)
        await TestHelper.waitForWebhooks(2 * (i + 1))
      }
      const req = TestHelper.createRequest(`/api/user/subscriptions/product-subscriptions?productid=${product.id}&offset=${offset}`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const subscriptionsNow = await req.route.api.get(req)
      for (let i = 0, len = global.PAGE_SIZE; i < len; i++) {
        assert.equal(subscriptionsNow[i].id, subscriptions[offset + i].id)
      }
    })
  })
})
