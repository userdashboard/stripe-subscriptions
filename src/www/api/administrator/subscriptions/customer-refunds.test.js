/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/administrator/subscriptions/customer-refunds', () => {
  describe('CustomerRefunds#GET', () => {
    it('should limit refunds on customer to one page', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan1 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 1000})
      const plan2 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 2000})
      const plan3 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 3000})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, plan1.id)
      const chargeid1 = await TestHelper.waitForNextItem(`subscription:charges:${user.subscription.id}`, null)
      await TestHelper.createRefund(administrator, chargeid1)
      await TestHelper.waitForNextItem(`subscription:refunds:${user.subscripton.id}`, null)
      await TestHelper.createSubscription(user, plan2.id)
      const chargeid2 = await TestHelper.waitForNextItem(`subscription:charges:${user.subscription.id}`, null)
      const refund2 = await TestHelper.createRefund(administrator, chargeid2)
      await TestHelper.waitForNextItem(`subscription:refunds:${user.subscripton.id}`, null)
      await TestHelper.createSubscription(user, plan3.id)
      const chargeid3 = await TestHelper.waitForNextItem(`subscription:charges:${user.subscription.id}`, null)
      const refund3 = await TestHelper.createRefund(administrator, chargeid3)
      await TestHelper.waitForNextItem(`subscription:refunds:${user.subscripton.id}`, null)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/customer-refunds?customerid=${user.customer.id}`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      const refunds = await req.route.api.get(req)
      assert.equal(refunds.length, 2)
      assert.equal(refunds[0].id, refund3.id)
      assert.equal(refunds[1].id, refund2.id)
    })
  })
})
