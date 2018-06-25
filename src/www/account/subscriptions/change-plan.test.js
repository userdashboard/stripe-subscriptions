/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe(`/account/subscriptions/change-plan`, async () => {
  describe('ChangePlan#BEFORE', () => {
    it('should bind subscription to req', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 1000, trial_period_days: 0})
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, administrator.plan.id)
      const req = TestHelper.createRequest(`/account/subscriptions/change-plan?subscriptionid=${user.subscription.id}`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      await req.route.api.before(req)
      assert.notEqual(req.data, null)
      assert.notEqual(req.data.subscription, null)
      assert.equal(req.data.subscription.id, user.subscription.id)
    })
  })

  describe('ChangePlan#GET', () => {
    it('should present the form', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 1000, trial_period_days: 0})
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, administrator.plan.id)
      const req = TestHelper.createRequest(`/account/subscriptions/change-plan?subscriptionid=${user.subscription.id}`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        assert.notEqual(null, doc)
        assert.notEqual(null, doc.getElementById('submit-form'))
        assert.notEqual(null, doc.getElementById('submit-button'))
      }
      return req.route.api.get(req, res)
    })

    it('should present the subscription table', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 1000, trial_period_days: 0})
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, administrator.plan.id)
      const req = TestHelper.createRequest(`/account/subscriptions/change-plan?subscriptionid=${user.subscription.id}`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        const tr = doc.getElementById(user.subscription.id)
        assert.notEqual(null, tr)
      }
      return req.route.api.get(req, res)
    })
  })

  describe('ChangePlan#POST', () => {
    it('should reject same plan', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan1 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 1000, trial_period_days: 0})
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, plan1.id)
      const req = TestHelper.createRequest(`/account/subscriptions/change-plan?subscriptionid=${user.subscription.id}`, 'POST')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      req.body = {
        planid: plan1.id
      }
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        const messageContainer = doc.getElementById('message-container')
        assert.notEqual(null, messageContainer)
        assert.notEqual(null, messageContainer.child)
        const message = messageContainer.child[0]
        assert.equal('invalid-plan', message.attr.template)
      }
      return req.route.api.post(req, res)
    })

    it('should reject never published plan', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan1 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 1000, trial_period_days: 0})
      const plan2 = await TestHelper.createPlan(administrator, {productid: product.id, amount: 1000, trial_period_days: 0})
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, plan1.id)
      const req = TestHelper.createRequest(`/account/subscriptions/change-plan?subscriptionid=${user.subscription.id}`, 'POST')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      req.body = {
        planid: plan2.id
      }
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        const messageContainer = doc.getElementById('message-container')
        assert.notEqual(null, messageContainer)
        assert.notEqual(null, messageContainer.child)
        const message = messageContainer.child[0]
        assert.equal('invalid-plan', message.attr.template)
      }
      return req.route.api.post(req, res)
    })

    it('should reject unpublished plan', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan1 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 1000, trial_period_days: 0})
      const plan2 = await TestHelper.createPlan(administrator, {productid: product.id}, {published: true, unpublished: true}, 1000, 0)
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, plan1.id)
      const req = TestHelper.createRequest(`/account/subscriptions/change-plan?subscriptionid=${user.subscription.id}`, 'POST')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      req.body = {
        planid: plan2.id
      }
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        const messageContainer = doc.getElementById('message-container')
        assert.notEqual(null, messageContainer)
        assert.notEqual(null, messageContainer.child)
        const message = messageContainer.child[0]
        assert.equal('invalid-plan', message.attr.template)
      }
      return req.route.api.post(req, res)
    })

    it('should reject paid plan without payment information', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan1 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 0})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user, false)
      await TestHelper.createSubscription(user, plan1.id)
      const plan2 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 2000, trial_period_days: 0})
      const req = TestHelper.createRequest(`/account/subscriptions/change-plan?subscriptionid=${user.subscription.id}`, 'POST')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      req.body = {
        planid: plan2.id
      }
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        const messageContainer = doc.getElementById('message-container')
        assert.notEqual(null, messageContainer)
        assert.notEqual(null, messageContainer.child)
        const message = messageContainer.child[0]
        assert.equal('invalid-payment_source', message.attr.template)
      }
      return req.route.api.post(req, res)
    })

    it('should apply after authorization', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan1 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 1000, trial_period_days: 0})
      const plan2 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 1000, trial_period_days: 0})
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, plan1.id)
      const req = TestHelper.createRequest(`/account/subscriptions/change-plan?subscriptionid=${user.subscription.id}`, 'POST')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      req.body = {
        planid: plan2.id
      }
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        req.session = await TestHelper.unlockSession(user)
        const res2 = TestHelper.createResponse()
        res2.end = async (str) => {
          const doc = TestHelper.extractDoc(str)
          const messageContainer = doc.getElementById('message-container')
          assert.notEqual(null, messageContainer)
          assert.notEqual(null, messageContainer.child)
          const message = messageContainer.child[0]
          assert.equal('success', message.attr.template)
        }
        return req.route.api.get(req, res2)
      }
      return req.route.api.post(req, res)
    })
  })
})
