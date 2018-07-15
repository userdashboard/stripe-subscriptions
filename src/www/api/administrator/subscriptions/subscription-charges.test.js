/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/administrator/subscriptions/subscription-charges', () => {
  describe('SubscriptionCharges#GET', () => {
    it('should limit charges on subscription to one page', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan1 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 1000})
      const plan2 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 2000})
      const plan3 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 3000})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, plan1.id)
      const chargeid1 = await TestHelper.waitForNextItem(`subscription:charges:${user.subscription.id}`, null)
      await TestHelper.changeSubscription(user, plan2.id)
      const chargeid2 = await TestHelper.waitForNextItem(`subscription:charges:${user.subscription.id}`, chargeid1)
      await TestHelper.changeSubscription(user, plan3.id)
      const chargeid3 = await TestHelper.waitForNextItem(`subscription:charges:${user.subscription.id}`, chargeid2)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/subscription-charges?subscriptionid=${user.subscription.id}`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      const charges = await req.route.api.get(req)
      assert.equal(charges.length, 2)
      assert.equal(charges[0].id, chargeid3)
      assert.equal(charges[1].id, chargeid2)
    })
  })
})
