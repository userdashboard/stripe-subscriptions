/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/administrator/subscriptions/refunds', () => {
  describe('Refunds#BEFORE', () => {
    it('should bind refunds to req', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 1000, trial_period_days: 0})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, administrator.plan.id)
      const chargeid1 = await TestHelper.waitForNextItem(`subscription:charges:${user.subscription.id}`, null)
      await TestHelper.createRefund(administrator, chargeid1)
      const refundid1 = await TestHelper.waitForNextItem(`subscription:refunds:${user.subscription.id}`, null)
      const user2 = await TestHelper.createUser()
      await TestHelper.createCustomer(user2)
      await TestHelper.createCard(user2)
      await TestHelper.createSubscription(user2, administrator.plan.id)
      const chargeid2 = await TestHelper.waitForNextItem(`subscription:charges:${user2.subscription.id}`, null)
      await TestHelper.createRefund(administrator, chargeid2)
      const refundid2 = await TestHelper.waitForNextItem(`subscription:refunds:${user2.subscription.id}`, null)
      const req = TestHelper.createRequest(`/administrator/subscriptions/refunds`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      await req.route.api.before(req)
      assert.notEqual(req.data, null)
      assert.notEqual(req.data.refunds, null)
      assert.equal(req.data.refunds[0].id, refundid2)
      assert.equal(req.data.refunds[1].id, refundid1)
    })
  })

  describe('Refunds#GET', () => {
    it('should enforce page size', async () => {
      global.PAGE_SIZE = 3
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 1000, trial_period_days: 0})
      for (let i = 0, len = global.PAGE_SIZE + 1; i < len; i++) {
        const user = await TestHelper.createUser()
        await TestHelper.createCustomer(user)
        await TestHelper.createCard(user)
        await TestHelper.createSubscription(user, administrator.plan.id)
        const chargeid = await TestHelper.waitForNextItem(`subscription:charges:${user.subscription.id}`, null)
        await TestHelper.createRefund(administrator, chargeid)
        await TestHelper.waitForNextItem(`subscription:refunds:${user.subscription.id}`, null)
      }
      const req = TestHelper.createRequest('/administrator/subscriptions/refunds', 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        assert.notEqual(null, doc)
        const table = doc.getElementById('refunds-table')
        const rows = table.getElementsByTagName('tr')
        assert.equal(rows.length, global.PAGE_SIZE + 1)
      }
      return req.route.api.get(req, res)
    })

    it('should enforce specified offset', async () => {
      const offset = 1
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 1000, trial_period_days: 0})
      const refunds = []
      for (let i = 0, len = global.PAGE_SIZE + offset + 1; i < len; i++) {
        const user = await TestHelper.createUser()
        await TestHelper.createCustomer(user)
        await TestHelper.createCard(user)
        await TestHelper.createSubscription(user, administrator.plan.id)
        const chargeid = await TestHelper.waitForNextItem(`subscription:charges:${user.subscription.id}`, null)
        await TestHelper.createRefund(administrator, chargeid)
        await TestHelper.waitForNextItem(`subscription:refunds:${user.subscription.id}`, null)
        refunds.unshift(administrator.refund)
      }
      const req = TestHelper.createRequest(`/administrator/subscriptions/refunds?offset=${offset}`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        assert.notEqual(null, doc)
        for (let i = 0, len = global.PAGE_SIZE; i < len; i++) {
          assert.notEqual(null, doc.getElementById(refunds[offset + i].id))
        }
      }
      return req.route.api.get(req, res)
    })
  })
})
