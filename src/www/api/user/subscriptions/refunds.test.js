/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/user/subscriptions/refunds', () => {
  describe('Refunds#GET', () => {
    it('should limit refunds to one page', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan1 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 10000})
      const plan2 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 20000})
      const plan3 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 30000})
      const plan4 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 40000})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, plan1.id)
      await TestHelper.waitForWebhooks(2)
      await TestHelper.changeSubscription(user, plan2.id)
      await TestHelper.waitForWebhooks(4)
      await TestHelper.createRefund(administrator, user.charge)
      await TestHelper.waitForWebhooks(5)
      await TestHelper.createSubscription(user, plan3.id)
      await TestHelper.waitForWebhooks(7)
      await TestHelper.changeSubscription(user, plan4.id)
      await TestHelper.waitForWebhooks(9)
      const refund2 = await TestHelper.createRefund(administrator, user.charge)
      await TestHelper.waitForWebhooks(10)
      await TestHelper.createSubscription(user, plan1.id)
      await TestHelper.waitForWebhooks(12)
      await TestHelper.changeSubscription(user, plan2.id)
      await TestHelper.waitForWebhooks(14)
      const refund3 = await TestHelper.createRefund(administrator, user.charge)
      await TestHelper.waitForWebhooks(15)
      const req = TestHelper.createRequest(`/api/user/subscriptions/refunds?customerid=${user.customer.id}`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const refunds = await req.route.api.get(req)
      assert.equal(refunds.length, 2)
      assert.equal(refunds[0].id, refund3.id)
      assert.equal(refunds[1].id, refund2.id)
    })

    it('should enforce page size', async () => {
      global.PAGE_SIZE = 3
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan1 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 10000})
      const plan2 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 20000})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      let webhook = 0
      for (let i = 0, len = global.PAGE_SIZE + 1; i < len; i++) {
        await TestHelper.createSubscription(user, plan1.id)
        webhook += 2
        await TestHelper.waitForWebhooks(webhook)
        await TestHelper.changeSubscription(user, plan2.id)
        webhook += 2
        await TestHelper.waitForWebhooks(webhook)
        await TestHelper.loadCharge(user, user.subscription.id)
        await TestHelper.createRefund(administrator, user.charge)
        webhook += 1
        await TestHelper.waitForWebhooks(webhook)
      }
      const req = TestHelper.createRequest(`/api/user/subscriptions/refunds?customerid=${user.customer.id}`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const refundsNow = await req.route.api.get(req)
      assert.equal(refundsNow.length, global.PAGE_SIZE)
    })

    it('should enforce specified offset', async () => {
      const offset = 1
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan1 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 10000})
      const plan2 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 20000})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      const refunds = []
      let webhook = 0
      for (let i = 0, len = global.PAGE_SIZE + 1; i < len; i++) {
        await TestHelper.createSubscription(user, plan1.id)
        webhook += 2
        await TestHelper.waitForWebhooks(webhook)
        await TestHelper.changeSubscription(user, plan2.id)
        webhook += 2
        await TestHelper.waitForWebhooks(webhook)
        await TestHelper.loadCharge(user, user.subscription.id)
        const refund = await TestHelper.createRefund(administrator, user.charge)
        webhook += 1
        await TestHelper.waitForWebhooks(webhook)
        refunds.unshift(refund)
      }
      const req = TestHelper.createRequest(`/api/user/subscriptions/refunds?customerid=${user.customer.id}&offset=${offset}`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const refundsNow = await req.route.api.get(req)
      for (let i = 0, len = global.PAGE_SIZE; i < len; i++) {
        assert.equal(refundsNow[i].id, refunds[offset + i].id)
      }
    })
  })
})
