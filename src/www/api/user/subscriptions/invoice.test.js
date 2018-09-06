/* eslint-env mocha */
const assert = require('assert')
const dashboard = require('@userappstore/dashboard')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/user/subscriptions/invoice', () => {
  describe('Invoice#GET', () => {
    it('should reject invalid invoice', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/subscriptions/invoice?invoiceid=invalid`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      let errorMessage
      try {
        await req.route.api.get(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-invoiceid')
    })

    it('should reject other account\'s invoice', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 10000})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, administrator.plan.id)
      await TestHelper.waitForNextItem(`subscription:invoices:${user.subscription.id}`, null)
      const invoiceid = await dashboard.RedisList.list(`${process.env.APPID}:customer:invoices:${user.customer.id}`, 0, 1)
      const user2 = await TestHelper.createUser()
      await TestHelper.createCustomer(user2)
      const req = TestHelper.createRequest(`/api/user/subscriptions/invoice?invoiceid=${invoiceid}`, 'GET')
      req.account = user2.account
      req.session = user2.session
      req.customer = user2.customer
      let errorMessage
      try {
        await req.route.api.get(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-account')
    })

    it('should return invoice data', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 10000})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, administrator.plan.id)
      await TestHelper.waitForNextItem(`subscription:invoices:${user.subscription.id}`, null)
      const invoiceid = await dashboard.RedisList.list(`${process.env.APPID}:customer:invoices:${user.customer.id}`, 0, 1)
      const req = TestHelper.createRequest(`/api/user/subscriptions/invoice?invoiceid=${invoiceid}`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const invoice = await req.route.api.get(req)
      assert.equal(invoice.id, invoiceid)
    })
  })
})
