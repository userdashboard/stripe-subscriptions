/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe(`/account/subscriptions/subscriptions`, async () => {
  describe('Subscriptions#BEFORE', () => {
    it('should bind subscriptions to req', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan1 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 1000, trial_period_days: 0})
      const plan2 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 2000, trial_period_days: 0})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, plan1.id)
      await TestHelper.waitForWebhooks(2)
      await TestHelper.createSubscription(user, plan2.id)
      await TestHelper.waitForWebhooks(4)
      const req = TestHelper.createRequest(`/account/subscriptions/subscriptions`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      await req.route.api.before(req)
      assert.notEqual(req.data, null)
      assert.notEqual(req.data.subscriptions, null)
      assert.equal(req.data.subscriptions.length, 2)
    })
  })

  describe('Subscriptions#GET', () => {
    it('should enforce page size', async () => {
      global.PAGE_SIZE = 3
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      let webhook = 0
      for (let i = 0, len = global.PAGE_SIZE + 1; i < len; i++) {
        await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 1000, trial_period_days: 0})
        await TestHelper.createSubscription(user, administrator.plan.id)
        webhook += 2
        await TestHelper.waitForWebhooks(webhook)
      }
      const req = TestHelper.createRequest('/account/subscriptions/subscriptions', 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        assert.notEqual(null, doc)
        const table = doc.getElementById('subscriptions-table')
        const rows = table.getElementsByTagName('tr')
        assert.equal(rows.length, global.PAGE_SIZE + 1)
      }
      return req.route.api.get(req, res)
    })

    it('should enforce specified offset', async () => {
      const offset = 1
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      const subscriptions = []
      let webhook = 0
      for (let i = 0, len = global.PAGE_SIZE + offset + 1; i < len; i++) {
        await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 1000, trial_period_days: 0})
        await TestHelper.createSubscription(user, administrator.plan.id)
        webhook += 2
        await TestHelper.waitForWebhooks(webhook)
        subscriptions.push(user.subscription)
      }
      const req = TestHelper.createRequest(`/account/subscriptions/subscriptions?offset=${offset}`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        assert.notEqual(null, doc)
        for (let i = 0, len = global.PAGE_SIZE; i < len; i++) {
          assert.notEqual(null, doc.getElementById(subscriptions[offset + i].id))
        }
      }
      return req.route.api.get(req, res)
    })
  })
})
