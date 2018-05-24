/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../test-helper.js')

describe(`/administrator/subscriptions/refund-charge`, async () => {
  describe('RefundCharge#BEFORE', () => {
    it('should reject invalid chargeid', async () => {
      const administrator = await TestHelper.createAdministrator()
      const req = TestHelper.createRequest(`/administrator/subscriptions/refund-charge?chargeid=invalid`, 'GET')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
      let errorMessage
      try {
        await req.route.api.before(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-chargeid')
    })

    it('should reject refunded charge', async () => {
      const administrator = await TestHelper.createAdministrator()
      const plan1 = await TestHelper.createPlan(administrator, {published: true}, {}, 1000, 0)
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, plan1.id)
      const req = TestHelper.createRequest(`/administrator/subscriptions/refund-charge?chargeid=${user.charge.id}`, 'GET')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
      req.body = {
        amount: '1000'
      }
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        await TestHelper.completeAuthorization(req)
        await req.route.api.before(req)
        let errorMessage
        try {
          await req.route.api.before(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.equal(errorMessage, 'invalid-charge')
      }
      return req.route.api.post(req, res)
    })

    it('should bind charge to req', async () => {
      const administrator = await TestHelper.createAdministrator()
      const plan1 = await TestHelper.createPlan(administrator, {published: true}, {}, 1000, 0)
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, plan1.id)
      const req = TestHelper.createRequest(`/administrator/subscriptions/refund-charge?chargeid=${user.charge.id}`, 'GET')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
      await req.route.api.before(req)
      assert.notEqual(req.data, null)
      assert.notEqual(req.data.charge, null)
      assert.equal(req.data.charge.id, user.charge.id)
    })
  })

  describe('RefundCharge#GET', () => {
    it('should present the form', async () => {
      const administrator = await TestHelper.createAdministrator()
      const plan1 = await TestHelper.createPlan(administrator, {published: true}, {}, 1000, 0)
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, plan1.id)
      const req = TestHelper.createRequest(`/administrator/subscriptions/refund-charge?chargeid=${user.charge.id}`, 'GET')
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

  describe('RefundCharge#POST', () => {
    it('should apply after authorization', async () => {
      const administrator = await TestHelper.createAdministrator()
      const plan1 = await TestHelper.createPlan(administrator, {published: true}, {}, 1000, 0)
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, plan1.id)
      const req = TestHelper.createRequest(`/administrator/subscriptions/refund-charge?chargeid=${user.charge.id}`, 'POST')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
      req.body = {
        amount: 1000
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
        return req.route.api.post(req, res2)
      }
      return req.route.api.post(req, res)
    })
  })
})
