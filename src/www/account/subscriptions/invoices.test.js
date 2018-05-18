/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../test-helper.js')

describe(`/account/subscriptions/invoices`, async () => {
  describe('Invoices#BEFORE', () => {
    it('should bind invoices to req', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true}, {}, 1000, 0)
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, administrator.plan.id)
      const req = TestHelper.createRequest(`/account/subscriptions/invoices`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      await req.route.api.before(req)
      assert.notEqual(req.data, null)
      assert.notEqual(req.data.invoices, null)
      assert.equal(req.data.invoices.length, 1)
    })
  })

  describe('Invoices#GET', () => {
    it('should have row for each invoice', async () => {
      const administrator = await TestHelper.createAdministrator()
      const plan1 = await TestHelper.createPlan(administrator, {published: true}, {}, 1000, 0)
      const plan2 = await TestHelper.createPlan(administrator, {published: true}, {}, 2000, 0)
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, plan1.id)
      const invoice1 = user.invoice
      await TestHelper.createSubscription(user, plan2.id)
      const invoice2 = user.invoice
      const req = TestHelper.createRequest('/account/subscriptions/invoices', 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        assert.notEqual(null, doc)
        const invoice1Row = doc.getElementById(invoice1.id)
        assert.notEqual(null, invoice1Row)
        const invoice2Row = doc.getElementById(invoice2.id)
        assert.notEqual(null, invoice2Row)
      }
      return req.route.api.get(req, res)
    })
  })
})
