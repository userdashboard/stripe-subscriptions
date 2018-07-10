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
      await TestHelper.waitForWebhooks(2)
      await TestHelper.loadCharge(user, user.subscription.id)
      const refund1 = await TestHelper.createRefund(administrator, user.charge)
      await TestHelper.waitForWebhooks(3)
      const user2 = await TestHelper.createUser()
      await TestHelper.createCustomer(user2)
      await TestHelper.createCard(user2)
      await TestHelper.createSubscription(user2, administrator.plan.id)
      await TestHelper.waitForWebhooks(5)
      await TestHelper.loadCharge(user2, user2.subscription.id)
      const refund2 = await TestHelper.createRefund(administrator, user2.charge)
      await TestHelper.waitForWebhooks(6)
      const req = TestHelper.createRequest(`/administrator/subscriptions/refunds`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      await req.route.api.before(req)
      assert.notEqual(req.data, null)
      assert.notEqual(req.data.refunds, null)
      assert.equal(req.data.refunds[0].id, refund2.id)
      assert.equal(req.data.refunds[1].id, refund1.id)
    })
  })

  describe('Refunds#GET', () => {
    it('should enforce page size', async () => {
      global.PAGE_SIZE = 3
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 1000, trial_period_days: 0})
      let webhook = 0
      for (let i = 0, len = global.PAGE_SIZE + 1; i < len; i++) {
        const user = await TestHelper.createUser()
        await TestHelper.createCustomer(user)
        await TestHelper.createCard(user)
        await TestHelper.createSubscription(user, administrator.plan.id)
        webhook += 2
        await TestHelper.waitForWebhooks(webhook)
        await TestHelper.loadCharge(user, user.subscription.id)
        await TestHelper.createRefund(administrator, user.charge)
        webhook++
        await TestHelper.waitForWebhooks(webhook)
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
      let webhook = 0
      for (let i = 0, len = global.PAGE_SIZE + offset + 1; i < len; i++) {
        const user = await TestHelper.createUser()
        await TestHelper.createCustomer(user)
        await TestHelper.createCard(user)
        await TestHelper.createSubscription(user, administrator.plan.id)
        webhook += 2
        await TestHelper.waitForWebhooks(webhook)
        await TestHelper.loadCharge(user, user.subscription.id)
        await TestHelper.createRefund(administrator, user.charge)
        webhook++
        await TestHelper.waitForWebhooks(webhook)
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
