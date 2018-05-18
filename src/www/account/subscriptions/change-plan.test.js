/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../test-helper.js')

describe(`/account/subscriptions/change-plan`, async () => {
  describe('ChangePlan#BEFORE', () => {
    it('should bind subscription to req', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true}, {}, 1000, 0)
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
      await TestHelper.createPlan(administrator, {published: true}, {}, 1000, 0)
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
        assert.notEqual(null, doc.getElementById('submitForm'))
        assert.notEqual(null, doc.getElementById('submitButton'))
      }
      return req.route.api.get(req, res)
    })
  })

  describe('ChangePlan#POST', () => {
    it('should reject same plan', async () => {
      const administrator = await TestHelper.createAdministrator()
      const plan1 = await TestHelper.createPlan(administrator, {published: true}, {}, 1000, 0)
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
        const messageContainer = doc.getElementById('messageContainer')
        assert.notEqual(null, messageContainer)
        assert.notEqual(null, messageContainer.child)
        const message = messageContainer.child[0]
        assert.equal('invalid-plan', message.attr.error)
      }
      return req.route.api.post(req, res)
    })

    it('should reject never published plan', async () => {
      const administrator = await TestHelper.createAdministrator()
      const plan1 = await TestHelper.createPlan(administrator, {published: true}, {}, 1000, 0)
      const plan2 = await TestHelper.createPlan(administrator, {}, {}, 1000, 0)
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
        const messageContainer = doc.getElementById('messageContainer')
        assert.notEqual(null, messageContainer)
        assert.notEqual(null, messageContainer.child)
        const message = messageContainer.child[0]
        assert.equal('invalid-plan', message.attr.error)
      }
      return req.route.api.post(req, res)
    })

    it('should reject unpublished plan', async () => {
      const administrator = await TestHelper.createAdministrator()
      const plan1 = await TestHelper.createPlan(administrator, {published: true}, {}, 1000, 0)
      const plan2 = await TestHelper.createPlan(administrator, {}, {published: true, unpublished: true}, 1000, 0)
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
        const messageContainer = doc.getElementById('messageContainer')
        assert.notEqual(null, messageContainer)
        assert.notEqual(null, messageContainer.child)
        const message = messageContainer.child[0]
        assert.equal('invalid-plan', message.attr.error)
      }
      return req.route.api.post(req, res)
    })

    it('should reject paid plan without payment information', async () => {
      const administrator = await TestHelper.createAdministrator()
      const plan1 = await TestHelper.createPlan(administrator, {published: true}, {}, 0, 0)
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user, false)
      await TestHelper.createSubscription(user, plan1.id)
      const plan2 = await TestHelper.createPlan(administrator, {published: true}, {}, 2000, 0)
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
        const messageContainer = doc.getElementById('messageContainer')
        assert.notEqual(null, messageContainer)
        assert.notEqual(null, messageContainer.child)
        const message = messageContainer.child[0]
        assert.equal('invalid-payment_source', message.attr.error)
      }
      return req.route.api.post(req, res)
    })

    it('should apply after authorization', async () => {
      const administrator = await TestHelper.createAdministrator()
      const plan1 = await TestHelper.createPlan(administrator, {published: true}, {}, 1000, 0)
      const plan2 = await TestHelper.createPlan(administrator, {published: true}, {}, 1000, 0)
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
        await TestHelper.completeAuthorization(req)
        const res2 = TestHelper.createResponse()
        res2.end = async (str) => {
          const doc = TestHelper.extractDoc(str)
          const messageContainer = doc.getElementById('messageContainer')
          assert.notEqual(null, messageContainer)
          assert.notEqual(null, messageContainer.child)
          const message = messageContainer.child[0]
          assert.equal('success', message.attr.error)
        }
        return req.route.api.get(req, res2)
      }
      return req.route.api.post(req, res)
    })
  })
})
