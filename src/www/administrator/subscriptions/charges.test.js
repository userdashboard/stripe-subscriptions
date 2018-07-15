/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/administrator/subscriptions/charges', () => {
  describe('Charges#BEFORE', () => {
    it('should bind charges to req', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 1000, trial_period_days: 0})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, administrator.plan.id)
      const chargeid = await TestHelper.waitForNextItem(`subscription:charges:${user.subscription.id}`, null)
      const req = TestHelper.createRequest(`/administrator/subscriptions/charges`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      await req.route.api.before(req)
      assert.notEqual(req.data, null)
      assert.notEqual(req.data.charges, null)
      assert.equal(req.data.charges[0].id, chargeid)
    })
  })

  describe('Charges#GET', () => {
    it('should enforce page size', async () => {
      global.PAGE_SIZE = 3
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      for (let i = 0, len = global.PAGE_SIZE + 1; i < len; i++) {
        await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 1000, trial_period_days: 0})
        await TestHelper.createSubscription(user, administrator.plan.id)
        await TestHelper.waitForNextItem(`subscription:charges:${user.subscription.id}`, null)
      }
      const req = TestHelper.createRequest('/administrator/subscriptions/charges', 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        assert.notEqual(null, doc)
        const table = doc.getElementById('charges-table')
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
      let charges = []
      for (let i = 0, len = global.PAGE_SIZE + offset + 1; i < len; i++) {
        await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 1000, trial_period_days: 0})
        await TestHelper.createSubscription(user, administrator.plan.id)
        const chargeid = await TestHelper.waitForNextItem(`subscription:charges:${user.subscription.id}`, null)
        charges.unshift(chargeid)
      }
      const req = TestHelper.createRequest(`/administrator/subscriptions/charges?offset=${offset}`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        assert.notEqual(null, doc)
        for (let i = 0, len = global.PAGE_SIZE; i < len; i++) {
          assert.notEqual(null, doc.getElementById(charges[offset + i]))
        }
      }
      return req.route.api.get(req, res)
    })
  })
})
