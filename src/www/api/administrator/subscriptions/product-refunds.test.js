/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/administrator/subscriptions/product-refunds', () => {
  describe('ProductRefunds#GET', () => {
    it('should limit refunds on product to one page', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 1000})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, plan.id)
      const chargeid1 = await TestHelper.waitForNextItem(`subscription:charges:${user.subscription.id}`, null)
      await TestHelper.createRefund(administrator, chargeid1)
      const user2 = await TestHelper.createUser()
      await TestHelper.createCustomer(user2)
      await TestHelper.createCard(user2)
      await TestHelper.createSubscription(user2, plan.id)
      const chargeid2 = await TestHelper.waitForNextItem(`subscription:charges:${user2.subscription.id}`, null)
      const refund2 = await TestHelper.createRefund(administrator, chargeid2)
      const user3 = await TestHelper.createUser()
      await TestHelper.createCustomer(user3)
      await TestHelper.createCard(user3)
      await TestHelper.createSubscription(user3, plan.id)
      const chargeid3 = await TestHelper.waitForNextItem(`subscription:charges:${user3.subscription.id}`, null)
      await TestHelper.createRefund(administrator, chargeid1)
      const refund3 = await TestHelper.createRefund(administrator, chargeid3)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/product-refunds?productid=${product.id}`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      const refunds = await req.route.api.get(req)
      assert.equal(refunds.length, 2)
      assert.equal(refunds[0].id, refund3.id)
      assert.equal(refunds[1].id, refund2.id)
    })
  })
})
