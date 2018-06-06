/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../test-helper.js')

describe(`/account/subscriptions/start-subscription`, async () => {
  describe('StartSubscription#BEFORE', () => {
    it('should reject invalid plan', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/subscriptions/start-subscription?planid=invalid', 'POST')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      let errorMessage
      try {
        await req.route.api.before(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-planid')
    })

    it('should reject never published plan', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {}, {}, 1000, 0)
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, administrator.plan.id)
      const req = TestHelper.createRequest(`/account/subscriptions/start-subscription?planid=${administrator.plan.id}`, 'POST')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      let errorMessage
      try {
        await req.route.api.before(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-plan')
    })

    it('should reject unpublished plan', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {}, {published: true, unpublished: true}, 1000, 0)
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, administrator.plan.id)
      const req = TestHelper.createRequest(`/account/subscriptions/start-subscription?planid=${administrator.plan.id}`, 'POST')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      let errorMessage
      try {
        await req.route.api.before(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-plan')
    })

    it('should bind plan to req', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true}, {}, 1000, 0)
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user, false)
      const req = TestHelper.createRequest(`/account/subscriptions/start-subscription?planid=${administrator.plan.id}`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      await req.route.api.before(req)
      assert.notEqual(req.data, null)
      assert.notEqual(req.data.plan, null)
      assert.equal(req.data.plan.id, administrator.plan.id)
    })
  })

  describe('StartSubscription#GET', () => {
    it('should present the form', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true}, {}, 1000, 0)
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user, false)
      const req = TestHelper.createRequest(`/account/subscriptions/start-subscription?planid=${administrator.plan.id}`, 'GET')
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

    it('should present the plan table', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true}, {}, 1000, 0)
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user, false)
      const req = TestHelper.createRequest(`/account/subscriptions/start-subscription?planid=${administrator.plan.id}`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        const tr = doc.getElementById(administrator.plan.id)
        assert.notEqual(null, tr)
      }
      return req.route.api.get(req, res)
    })
  })

  describe('StartSubscription#POST', () => {
    it('should reject customer without card', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true}, {}, 1000, 0)
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user, false)
      const req = TestHelper.createRequest(`/account/subscriptions/start-subscription?planid=${administrator.plan.id}`, 'POST')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        const messageContainer = doc.getElementById('message-container')
        assert.notEqual(null, messageContainer)
        assert.notEqual(null, messageContainer.child)
        const message = messageContainer.child[0]
        assert.equal('invalid-source', message.attr.template)
      }
      return req.route.api.post(req, res)
    })

    it('should reject duplicate subscription', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true}, {}, 1000, 0)
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, administrator.plan.id)
      const req = TestHelper.createRequest(`/account/subscriptions/start-subscription?planid=${administrator.plan.id}`, 'POST')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        const messageContainer = doc.getElementById('message-container')
        assert.notEqual(null, messageContainer)
        assert.notEqual(null, messageContainer.child)
        const message = messageContainer.child[0]
        assert.equal('duplicate-subscription', message.attr.template)
      }
      return req.route.api.post(req, res)
    })

    it('should apply after authorization', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true}, {}, 1000, 0)
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user, true)
      const req = TestHelper.createRequest(`/account/subscriptions/start-subscription?planid=${administrator.plan.id}`, 'POST')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        await TestHelper.completeAuthorization(req)
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
