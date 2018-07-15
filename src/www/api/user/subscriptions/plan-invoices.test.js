/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/user/subscriptions/plan-invoices', () => {
  describe('PlanInvoices#GET', () => {
    it('should limit invoices to one page', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 10000})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, administrator.plan.id)
      await TestHelper.waitForNextItem(`subscription:invoices:${user.subscription.id}`, null)
      await TestHelper.cancelSubscription(user, user.subscription.id)
      await TestHelper.createSubscription(user, administrator.plan.id)
      const invoice2 = await TestHelper.waitForNextItem(`subscription:invoices:${user.subscription.id}`, null)
      await TestHelper.cancelSubscription(user, user.subscription.id)
      await TestHelper.createSubscription(user, administrator.plan.id)
      const invoice3 = await TestHelper.waitForNextItem(`subscription:invoices:${user.subscription.id}`, null)
      await TestHelper.cancelSubscription(user, user.subscription.id)
      const req = TestHelper.createRequest(`/api/user/subscriptions/plan-invoices?planid=${administrator.plan.id}`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const invoices = await req.route.api.get(req)
      assert.equal(invoices.length, 2)
      assert.equal(invoices[0].id, invoice3.id)
      assert.equal(invoices[1].id, invoice2.id)
    })

    it('should enforce page size', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 10000})
      global.PAGE_SIZE = 3
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      for (let i = 0, len = global.PAGE_SIZE + 1; i < len; i++) {
        await TestHelper.createSubscription(user, administrator.plan.id)
        await TestHelper.cancelSubscription(user, administrator.plan.id)
      }
      const req = TestHelper.createRequest(`/api/user/subscriptions/plan-invoices?planid=${administrator.plan.id}`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const invoicesNow = await req.route.api.get(req)
      assert.equal(invoicesNow.length, global.PAGE_SIZE)
    })

    it('should enforce specified offset', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 10000})
      const offset = 1
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      const invoices = []
      for (let i = 0, len = offset + global.PAGE_SIZE + 1; i < len; i++) {
        await TestHelper.createSubscription(user, administrator.plan.id)
        const invoiceid = await TestHelper.waitForNextItem(`subscription:invoices:${user.subscription.id}`, null)
        await TestHelper.cancelSubscription(user, administrator.plan.id)
        invoices.unshift(invoiceid)
      }
      const req = TestHelper.createRequest(`/api/user/subscriptions/plan-invoices?planid=${administrator.plan.id}&offset=${offset}`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const invoicesNow = await req.route.api.get(req)
      for (let i = 0, len = global.PAGE_SIZE; i < len; i++) {
        assert.equal(invoicesNow[i].id, invoices[offset + i])
      }
    })
  })
})
