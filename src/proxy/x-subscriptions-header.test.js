/* eslint-env mocha */
const assert = require('assert')
const SubscriptionHeader = require('./x-subscriptions-header.js')
const TestHelper = require('../../test-helper.js')

describe(`proxy/x-subscriptions-header`, () => {
  describe('Subscriptions#AFTER', () => {
    it('should set subscription data in header', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 1000, trial_period_days: 0})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, administrator.plan.id)
      const req = TestHelper.createRequest(`/account/change-username`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      await SubscriptionHeader.after(req)
      assert.notEqual(null, req.headers['x-subscriptions'])
      const subscriptions = JSON.parse(req.headers['x-subscriptions'])
      assert.equal(subscriptions.length, 1)
      assert.equal(subscriptions[0].id, user.subscription.id)
    })
  })
})
