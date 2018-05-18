/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../test-helper.js')

describe(`/account/subscriptions/subscriptions`, async () => {
  describe('Subscriptions#BEFORE', () => {
    it('should bind subscriptions to req', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true}, {}, 1000, 0)
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, administrator.plan.id)
      const req = TestHelper.createRequest(`/account/subscriptions/subscriptions`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      await req.route.api.before(req)
      assert.notEqual(req.data, null)
      assert.notEqual(req.data.subscriptions, null)
      assert.equal(req.data.subscriptions.length, 1)
    })
  })

  describe('Subscriptions#GET', () => {
    it('should have row for each subscription', async () => {
      const administrator = await TestHelper.createAdministrator()
      const plan1 = await TestHelper.createPlan(administrator, {published: true}, {}, 1000, 0)
      const plan2 = await TestHelper.createPlan(administrator, {published: true}, {}, 2000, 0)
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, plan1.id)
      const subscription1 = user.subscription
      await TestHelper.createSubscription(user, plan2.id)
      const subscription2 = user.subscription
      const req = TestHelper.createRequest('/account/subscriptions/subscriptions', 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        assert.notEqual(null, doc)
        const subscription1Row = doc.getElementById(subscription1.id)
        assert.notEqual(null, subscription1Row)
        const subscription2Row = doc.getElementById(subscription2.id)
        assert.notEqual(null, subscription2Row)
      }
      return req.route.api.get(req, res)
    })
  })
})
