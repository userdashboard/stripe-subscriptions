/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe(`/account/subscriptions/plans`, async () => {
  describe('Plans#BEFORE', () => {
    it('should bind plans to req', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 1000, trial_period_days: 0})
      const plan2 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 1000, trial_period_days: 0})
      const plan3 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 2000, trial_period_days: 0})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      const req = TestHelper.createRequest(`/account/subscriptions/plans`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      await req.route.api.before(req)
      assert.notEqual(req.data, null)
      assert.notEqual(req.data.plans, null)
      assert.equal(req.data.plans.length, 2)
      assert.equal(req.data.plans[0].id, plan3.id)
      assert.equal(req.data.plans[1].id, plan2.id)
    })
  })

  describe('Plans#GET', () => {
    it('should enforce page size', async () => {
      global.PAGE_SIZE = 3
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      for (let i = 0, len = global.PAGE_SIZE + 1; i < len; i++) {
        await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 2000, trial_period_days: 0})
      }
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      const req = TestHelper.createRequest('/account/subscriptions/plans', 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        assert.notEqual(null, doc)
        const table = doc.getElementById('plans-table')
        const rows = table.getElementsByTagName('tr')
        assert.equal(rows.length, global.PAGE_SIZE + 1)
      }
      return req.route.api.get(req, res)
    })

    it('should enforce specified offset', async () => {
      const offset = 1
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plans = []
      for (let i = 0, len = global.PAGE_SIZE + offset + 1; i < len; i++) {
        const plan = await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 2000, trial_period_days: 0})
        plans.unshift(plan)
      }
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      const req = TestHelper.createRequest(`/account/subscriptions/plans?offset=${offset}`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        assert.notEqual(null, doc)
        for (let i = 0, len = global.PAGE_SIZE; i < len; i++) {
          assert.notEqual(null, doc.getElementById(plans[offset + i].id))
        }
      }
      return req.route.api.get(req, res)
    })
  })
})
