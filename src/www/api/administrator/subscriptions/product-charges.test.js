/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/administrator/subscriptions/product-charges', () => {
  describe('ProductCharges#GET', () => {
    it('should return list of charges on product', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan1 = await TestHelper.createPlan(administrator, {productid: product.id, published: true})
      const plan2 = await TestHelper.createPlan(administrator, {productid: product.id, published: true})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, plan1.id)
      await TestHelper.createSubscription(user, plan2.id)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/product-charges?productid=${user.product.id}`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      req.product = administrator.product
      const subscriptions = await req.route.api.get(req)
      assert.equal(subscriptions.length >= 2, true)
      assert.equal(subscriptions[0].amount, plan2.amount)
      assert.equal(subscriptions[1].amount, plan1.amount)
    })
  })
})
