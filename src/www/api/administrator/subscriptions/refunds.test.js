/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/administrator/subscriptions/refunds', () => {
  describe('Refunds#GET', () => {
    it('should return refund list', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true})
      const plan1 = administrator.plan
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, unpublished: true})
      const user1 = await TestHelper.createUser()
      await TestHelper.createCustomer(user1)
      await TestHelper.createCard(user1)
      await TestHelper.createSubscription(user1, plan1.id)
      await TestHelper.createRefund(user1, user1.subscription.id)
      const plan2 = administrator.plan
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true})
      const user2 = await TestHelper.createUser()
      await TestHelper.createCustomer(user2)
      await TestHelper.createCard(user2)
      await TestHelper.createSubscription(user2, plan2.id)
      const plan3 = administrator.plan
      const user3 = await TestHelper.createUser()
      await TestHelper.createCustomer(user3)
      await TestHelper.createCard(user3)
      await TestHelper.createSubscription(user3, plan3.id)
      await TestHelper.createRefund(user3, user3.subscription.id)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/refunds`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      const refunds = await req.route.api.get(req)
      assert.equal(true, refunds.length >= 2)
      assert.equal(refunds[0].id, user3.refund.id)
      assert.equal(refunds[1].id, user1.refund.id)
   })
 })
})
