/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../test-helper.js')

describe(`/administrator/subscriptions/delete-plan`, async () => {
  describe('DeletePlan#BEFORE', () => {
    it('should reject invalid planid', async () => {
      const administrator = await TestHelper.createAdministrator()
      const req = TestHelper.createRequest(`/administrator/subscriptions/delete-plan?planid=invalid`, 'GET')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
      try {
        await req.route.api.before(req)
      } catch (error) {
        assert.equal(error.message, 'invalid-planid')
      }
    })

    it('should bind plan to req', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true}, {}, 1000, 0)
      const req = TestHelper.createRequest(`/administrator/subscriptions/delete-plan?planid=${administrator.plan.id}`, 'GET')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
      await req.route.api.before(req)
      assert.notEqual(req.data, null)
      assert.notEqual(req.data.plan, null)
      assert.equal(req.data.plan.id, administrator.plan.id)
    })
  })

  describe('DeletePlan#GET', () => {
    it('should present the form', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true}, {}, 1000, 0)
      const req = TestHelper.createRequest(`/administrator/subscriptions/delete-plan?planid=${administrator.plan.id}`, 'GET')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
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

  describe('DeletePlan#POST', () => {
    it('should apply after authorization', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true}, {}, 1000, 0)
      const req = TestHelper.createRequest(`/administrator/subscriptions/delete-plan?planid=${administrator.plan.id}`, 'POST')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
      req.body = {}
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
        return req.route.api.post(req, res2)
      }
      return req.route.api.post(req, res)
    })
  })
})
