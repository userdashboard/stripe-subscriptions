/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/administrator/subscriptions/product-refunds', () => {
  describe('ProductRefunds#GET', () => {
    it('should return list of refunds on product', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan1 = await TestHelper.createPlan(administrator, {productid: product.id, published: true})
      const plan2 = await TestHelper.createPlan(administrator, {productid: product.id, published: true})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, plan1.id)
      const subscription1 = user.subscription
      await TestHelper.createSubscription(user, plan2.id)
      const subscription2 = user.subscription
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/product-refunds?productid=${user.product.id}`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      req.product = administrator.product
      const subscriptions = await req.route.api.get(req)
      assert.equal(subscriptions.length >= 2, true)
      assert.equal(subscriptions[0].amount, plan2.amount)
      assert.equal(subscriptions[0].subscription, subscription2.id)
      assert.equal(subscriptions[1].amount, plan1.amount)
      assert.equal(subscriptions[1].subscription, subscription1.id)
    })
  })
})
