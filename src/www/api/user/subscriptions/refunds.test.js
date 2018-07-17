/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/user/subscriptions/refunds', () => {
  describe('Refunds#GET', () => {
    it('should enforce page size', async () => {
      global.PAGE_SIZE = 3
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      for (let i = 0, len = global.PAGE_SIZE + 1; i < len; i++) {
        const plan = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 10000, interval: 'day'})
        await TestHelper.createSubscription(user, plan.id)
        await TestHelper.waitForNextItem(`subscription:invoices:${user.subscription.id}`, null)
        const chargeid = await TestHelper.waitForNextItem(`subscription:charges:${user.subscription.id}`, null)
        await TestHelper.createRefund(administrator, chargeid)
        await TestHelper.waitForNextItem(`subscription:refunds:${user.subscription.id}`, null)
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
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      const refunds = []
      for (let i = 0, len = global.PAGE_SIZE + 1; i < len; i++) {
        const plan = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 10000, interval: 'day'})
        await TestHelper.createSubscription(user, plan.id)
        await TestHelper.waitForNextItem(`subscription:invoices:${user.subscription.id}`, null)
        const chargeid = await TestHelper.waitForNextItem(`subscription:charges:${user.subscription.id}`, null)
        const refund = await TestHelper.createRefund(administrator, chargeid)
        refunds.unshift(refund)
        await TestHelper.waitForNextItem(`subscription:refunds:${user.subscription.id}`, null)
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
