/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../test-helper.js')

describe(`/administrator/subscriptions/edit-plan`, () => {
  describe('EditPlan#BEFORE', () => {
    it('should reject invalid planid', async () => {
      const administrator = await TestHelper.createAdministrator()
      const req = TestHelper.createRequest(`/administrator/subscriptions/edit-plan?planid=invalid`, 'GET')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
      try {
        await req.route.api.before(req)
      } catch (error) {
        assert.equal(error.message, 'invalid-planid')
      }
    })

    it('should reject unpublished plan', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true, unpublished: true}, {}, 1000, 0)
      const req = TestHelper.createRequest(`/administrator/subscriptions/edit-plan?planid=${administrator.plan.id}`, 'GET')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
      try {
        await req.route.api.before(req)
      } catch (error) {
        assert.equal(error.message, 'invalid-plan')
      }
    })

    it('should bind plan to req', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true}, {}, 1000, 0)
      const req = TestHelper.createRequest(`/administrator/subscriptions/edit-plan?planid=${administrator.plan.id}`, 'GET')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
      await req.route.api.before(req)
      assert.notEqual(req.data, null)
      assert.notEqual(req.data.plan, null)
      assert.equal(req.data.plan.id, administrator.plan.id)
    })
  })

  describe('EditPlan#GET', () => {
    it('should present the form', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true, unpublished: true}, {}, 1000, 0)
      const req = TestHelper.createRequest(`/administrator/subscriptions/edit-plan?planid=${administrator.plan.id}`, 'GET')
      req.account = administrator.account
      req.session = administrator.session
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

  describe('EditPlan#POST', () => {
    it('should reject missing productid', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true, unpublished: true}, {}, 1000, 0)
      const req = TestHelper.createRequest(`/administrator/subscriptions/edit-plan?planid=${administrator.plan.id}`, 'POST')
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        planid: 'plan' + new Date().getTime(),
        productid: null
      }
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        const messageContainer = doc.getElementById('messageContainer')
        assert.notEqual(null, messageContainer)
        assert.notEqual(null, messageContainer.child)
        const message = messageContainer.child[0]
        assert.equal('invalid-productid', message.attr.error)
      }
      return req.route.api.post(req, res)
    })

    it('should reject never published product', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {}, {}, 1000, 0)
      await TestHelper.createProduct(administrator, {})
      const req = TestHelper.createRequest(`/administrator/subscriptions/edit-plan?planid=${administrator.plan.id}`, 'POST')
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        planid: 'plan' + new Date().getTime(),
        productid: administrator.product.id
      }
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        const messageContainer = doc.getElementById('messageContainer')
        assert.notEqual(null, messageContainer)
        assert.notEqual(null, messageContainer.child)
        const message = messageContainer.child[0]
        assert.equal('invalid-product', message.attr.error)
      }
      return req.route.api.post(req, res)
    })

    it('should reject unpublished product', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true}, {}, 1000, 0)
      await TestHelper.createProduct(administrator, {published: true, unpublished: true})
      const req = TestHelper.createRequest(`/administrator/subscriptions/edit-plan?planid=${administrator.plan.id}`, 'POST')
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        planid: 'plan' + new Date().getTime(),
        productid: administrator.product.id
      }
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        const messageContainer = doc.getElementById('messageContainer')
        assert.notEqual(null, messageContainer)
        assert.notEqual(null, messageContainer.child)
        const message = messageContainer.child[0]
        assert.equal('invalid-product', message.attr.error)
      }
      return req.route.api.post(req, res)
    })

    it('should reject invalid trial_period_days', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true}, {}, 1000, 0)
      await TestHelper.createProduct(administrator, {published: true})
      const req = TestHelper.createRequest(`/administrator/subscriptions/edit-plan?planid=${administrator.plan.id}`, 'POST')
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        trial_period_days: 'invalid',
        productid: administrator.product.id
      }
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        const messageContainer = doc.getElementById('messageContainer')
        assert.notEqual(null, messageContainer)
        assert.notEqual(null, messageContainer.child)
        const message = messageContainer.child[0]
        assert.equal('invalid-trial_period_days', message.attr.error)
      }
      return req.route.api.post(req, res)
    })

    it('should update after authorization', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true}, {}, 1000, 0)
      await TestHelper.createProduct(administrator, {published: true})
      const req = TestHelper.createRequest(`/administrator/subscriptions/edit-plan?planid=${administrator.plan.id}`, 'POST')
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        productid: await administrator.product.id
      }
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        await TestHelper.completeAuthorization(req)
        const res3 = TestHelper.createResponse()
        res3.end = async (str) => {
          const doc = TestHelper.extractDoc(str)
          const messageContainer = doc.getElementById('messageContainer')
          assert.notEqual(null, messageContainer)
          assert.notEqual(null, messageContainer.child)
          const message = messageContainer.child[0]
          assert.equal('success', message.attr.error)
        }
        return req.route.api.get(req, res3)
      }
      return req.route.api.post(req, res)
    })
  })
})
