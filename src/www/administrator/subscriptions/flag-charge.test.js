/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe(`/administrator/subscriptions/set-charge-flagged`, async () => {
  describe('SetChargeFlagged#BEFORE', () => {
    it('should reject invalid chargeid', async () => {
      const administrator = await TestHelper.createAdministrator()
      const req = TestHelper.createRequest(`/administrator/subscriptions/set-charge-flagged?chargeid=invalid`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      let errorMessage
      try {
        await req.route.api.before(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-chargeid')
    })

    it('should reject unrefunded charge', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan1 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 1000, trial_period_days: 0})
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, plan1.id)
      const req = TestHelper.createRequest(`/administrator/subscriptions/set-charge-flagged?chargeid=${user.charge.id}`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      let errorMessage
      try {
        await req.route.api.before(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-charge')
    })

    it('should bind charge to req', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan1 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 1000, trial_period_days: 0})
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, plan1.id)
      await TestHelper.createRefund(user, user.subscription.id)
      const req = TestHelper.createRequest(`/administrator/subscriptions/set-charge-flagged?chargeid=${user.charge.id}`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      await req.route.api.before(req)
      assert.notEqual(req.data, null)
      assert.notEqual(req.data.charge, null)
      assert.equal(req.data.charge.id, user.charge.id)
    })
  })

  describe('SetChargeFlagged#GET', () => {
    it('should present the form', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan1 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 1000, trial_period_days: 0})
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, plan1.id)
      await TestHelper.createRefund(user, user.subscription.id)
      const req = TestHelper.createRequest(`/administrator/subscriptions/set-charge-flagged?chargeid=${user.charge.id}`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        assert.notEqual(null, doc)
        assert.notEqual(null, doc.getElementById('submit-form'))
        assert.notEqual(null, doc.getElementById('submit-button'))
      }
      return req.route.api.get(req, res)
    })

    it('should present the charge table', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan1 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 1000, trial_period_days: 0})
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, plan1.id)
      await TestHelper.createRefund(user, user.subscription.id)
      const req = TestHelper.createRequest(`/administrator/subscriptions/set-charge-flagged?chargeid=${user.charge.id}`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        const tr = doc.getElementById(user.charge.id)
        assert.notEqual(null, tr)
      }
      return req.route.api.get(req, res)
    })
  })

  describe('SetChargeFlagged#POST', () => {
    it('should apply after authorization', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan1 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 1000, trial_period_days: 0})
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, plan1.id)
      await TestHelper.createRefund(user, user.subscription.id)
      const req = TestHelper.createRequest(`/administrator/subscriptions/set-charge-flagged?chargeid=${user.charge.id}`, 'POST')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      req.body = {
        amount: 1000
      }
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
        return req.route.api.post(req, res2)
      }
      return req.route.api.post(req, res)
    })
  })
})
