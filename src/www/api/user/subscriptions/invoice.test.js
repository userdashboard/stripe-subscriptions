/* eslint-env mocha */
const assert = require('assert')
const dashboard = require('@userappstore/dashboard')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/user/subscriptions/dispute', () => {
  describe('dispute#GET', () => {
    it('should reject invalid dispute', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/subscriptions/dispute?disputeid=invalid`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      let errorMessage
      try {
        await req.route.api.get(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-disputeid')
    })

    it('should reject other account\'s dispute', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 10000})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, administrator.plan.id)
      await TestHelper.waitForWebhooks(2)
      const disputeid = await dashboard.RedisList.list(`customer:disputes:${user.customer.id}`, 0, 1)
      const user2 = await TestHelper.createUser()
      await TestHelper.createCustomer(user2)
      await TestHelper.createCard(user2)
      await TestHelper.createSubscription(user2, administrator.plan.id)
      await TestHelper.waitForWebhooks(4)
      const req = TestHelper.createRequest(`/api/user/subscriptions/dispute?disputeid=${disputeid}`, 'GET')
      req.account = user2.account
      req.session = user2.session
      req.customer = user2.customer
      let errorMessage
      try {
        await req.route.api.get(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-account')
    })

    it('should return dispute data', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 10000})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, administrator.plan.id)
      await TestHelper.waitForWebhooks(2)
      const disputeid = await dashboard.RedisList.list(`customer:disputes:${user.customer.id}`, 0, 1)
      const req = TestHelper.createRequest(`/api/user/subscriptions/dispute?disputeid=${disputeid}`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const dispute = await req.route.api.get(req)
      assert.equal(dispute.id, disputeid)
    })
  })
})
