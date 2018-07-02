/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe(`/api/user/subscriptions/set-dispute-paid`, () => {
  describe('SetdisputePaid#PATCH', () => {
    it('should reject invalid disputeid', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      const req = TestHelper.createRequest(`/api/user/subscriptions/set-dispute-paid?disputeid=invalid`, 'PATCH')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      req.body = {
        cardid: user.customer.default_source
      }
      let errorMessage
      try {
        await req.route.api.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-disputeid')
    })

    it('should reject other account\'s dispute', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan1 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 10000})
      const plan2 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 20000})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, plan1.id)
      await TestHelper.waitForWebhooks(2)
      await TestHelper.changeSubscription(user, plan2.id)
      await TestHelper.waitForWebhooks(4)
      const user2 = await TestHelper.createUser()
      await TestHelper.createCustomer(user2)
      await TestHelper.createCard(user2)
      const req = TestHelper.createRequest(`/api/user/subscriptions/set-dispute-paid?disputeid=${user.dispute.id}`, 'GET')
      req.account = user2.account
      req.session = user2.session
      req.customer = user2.customer
      req.body = {
        cardid: user2.customer.default_source
      }
      let errorMessage
      try {
        await req.route.api.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-account')
    })

    it('should reject paid dispute', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan1 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 20000})
      const plan2 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 10000})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, plan1.id)
      await TestHelper.waitForWebhooks(2)
      await TestHelper.changeSubscription(user, plan2.id)
      await TestHelper.waitForWebhooks(4)
      const req = TestHelper.createRequest(`/api/user/subscriptions/set-dispute-paid?disputeid=${user.dispute.id}`, 'PATCH')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      req.body = {
        cardid: user.customer.default_source
      }
      let errorMessage
      try {
        await req.route.api.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-dispute')
    })

    it('should reject forgiven dispute', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan1 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 10000})
      const plan2 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 20000})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, plan1.id)
      await TestHelper.waitForWebhooks(2)
      await TestHelper.changeSubscriptionWithoutPaying(user, plan2.id)
      await TestHelper.waitForWebhooks(3)
      user.dispute = await TestHelper.forgivedispute(administrator, user.dispute.id)
      const req = TestHelper.createRequest(`/api/user/subscriptions/set-dispute-paid?disputeid=${user.dispute.id}`, 'PATCH')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      req.body = {
        cardid: user.customer.default_source
      }
      let errorMessage
      try {
        await req.route.api.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-dispute')
    })

    it('should reject invalid source', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan1 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 10000})
      const plan2 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 20000})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, plan1.id)
      await TestHelper.waitForWebhooks(2)
      await TestHelper.changeSubscriptionWithoutPaying(user, plan2.id)
      await TestHelper.waitForWebhooks(3)
      const req = TestHelper.createRequest(`/api/user/subscriptions/set-dispute-paid?disputeid=${user.dispute.id}`, 'PATCH')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      req.body = {
        cardid: 'invalid'
      }
      let errorMessage
      try {
        await req.route.api.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-cardid')
    })

    it('should reject other account\'s source', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan1 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 10000})
      const plan2 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 20000})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      const user2 = await TestHelper.createUser()
      await TestHelper.createCustomer(user2)
      await TestHelper.createCard(user2)
      await TestHelper.createSubscription(user2, plan1.id)
      await TestHelper.waitForWebhooks(2)
      await TestHelper.changeSubscriptionWithoutPaying(user2, plan2.id)
      await TestHelper.waitForWebhooks(3)
      const req = TestHelper.createRequest(`/api/user/subscriptions/set-dispute-paid?disputeid=${user2.dispute.id}`, 'GET')
      req.account = user2.account
      req.session = user2.session
      req.customer = user2.customer
      req.body = {
        cardid: user.customer.default_source
      }
      let errorMessage
      try {
        await req.route.api.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-account')
    })

    it('should pay dispute', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true})
      const plan1 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 10000})
      const plan2 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 20000})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, plan1.id)
      await TestHelper.waitForWebhooks(2)
      await TestHelper.changeSubscriptionWithoutPaying(user, plan2.id)
      await TestHelper.waitForWebhooks(3)
      const req = TestHelper.createRequest(`/api/user/subscriptions/set-dispute-paid?disputeid=${user.dispute.id}`, 'PATCH')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      req.body = {
        cardid: user.customer.default_source
      }
      await req.route.api.patch(req)
      req.session = await TestHelper.unlockSession(user)
      await req.route.api.patch(req)
      assert.equal(req.success, true)
    })
  })
})
