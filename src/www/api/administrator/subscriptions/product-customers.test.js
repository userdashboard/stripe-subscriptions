/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/administrator/subscriptions/product-customers', () => {
  describe('ProductCustomers#GET', () => {
    it('should limit customers on product to one page', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 1000})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, plan.id)
      await TestHelper.waitForNextItem(`subscription:invoices:${user.subscription.id}`, null)
      const user2 = await TestHelper.createUser()
      await TestHelper.createCustomer(user2)
      await TestHelper.createCard(user2)
      await TestHelper.createSubscription(user2, plan.id)
      await TestHelper.waitForNextItem(`subscription:invoices:${user2.subscription.id}`, null)
      const user3 = await TestHelper.createUser()
      await TestHelper.createCustomer(user3)
      await TestHelper.createCard(user3)
      await TestHelper.createSubscription(user3, plan.id)
      await TestHelper.waitForNextItem(`subscription:invoices:${user3.subscription.id}`, null)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/product-customers?productid=${product.id}`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      const customers = await req.route.api.get(req)
      assert.equal(customers.length, 2)
      assert.equal(customers[0].id, user3.customer.id)
      assert.equal(customers[1].id, user2.customer.id)
    })
  })
})
