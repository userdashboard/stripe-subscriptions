/* eslint-env mocha */
const assert = require('assert')
const RequirePayment = require('./require-payment.js')
const TestHelper = require('../../test-helper.js')

describe('server/require-payment', async () => {
  describe('RequirePayment#AFTER', () => {
    it('should allow non-customer through', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/home`, 'GET')
      req.account = user.account
      req.session = user.session
      const res = TestHelper.createResponse()
      res.end = (str) => {}
      await RequirePayment.after(req, res)
      assert.notEqual(true, req.redirect)
    })

    it('should allow non-owing customer through', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      const req = TestHelper.createRequest(`/home`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const res = TestHelper.createResponse()
      res.end = (str) => {}
      await RequirePayment.after(req, res)
      assert.notEqual(true, req.redirect)
    })

    it('should allow owing customer access to /account/*', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan1 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 1000, trial_period_days: 0})
      const plan2 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 2000, trial_period_days: 0})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, plan1.id)
      await TestHelper.waitForWebhooks(2)
      await TestHelper.changeSubscription(user, plan2.id)
      await TestHelper.waitForWebhooks(3)
      const req = TestHelper.createRequest(`/account/change-username`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const res = TestHelper.createResponse()
      res.end = (str) => {}
      await RequirePayment.after(req, res)
      assert.notEqual(true, req.redirect)
    })

    it('should allow owing administrator access to /administrator/', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan1 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 1000, trial_period_days: 0})
      const plan2 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 2000, trial_period_days: 0})
      await TestHelper.createCustomer(administrator)
      await TestHelper.createCard(administrator)
      await TestHelper.createSubscription(administrator, plan1.id)
      await TestHelper.changeSubscriptionWithoutPaying(administrator, plan2.id)
      const req = TestHelper.createRequest(`/administrator/subscriptions/charges`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      req.customer = administrator.customer
      const res = TestHelper.createResponse()
      res.end = (str) => {}
      await RequirePayment.after(req, res)
      assert.notEqual(true, req.redirect)
    })

    it('should redirect owing customer to the payment form', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan1 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 1000, trial_period_days: 0})
      const plan2 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 2000, trial_period_days: 0})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, plan1.id)
      await TestHelper.waitForWebhooks(2)
      await TestHelper.changeSubscriptionWithoutPaying(user, plan2.id)
      await TestHelper.waitForWebhooks(3)
      const req = TestHelper.createRequest(`/home`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const res = TestHelper.createResponse()
      res.end = (str) => {
        assert.equal(true, req.redirect)
      }
      return RequirePayment.after(req, res)
    })
  })
})
