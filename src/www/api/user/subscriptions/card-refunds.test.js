/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/user/subscriptions/card-refunds', () => {
  describe('CardRefunds#GET', () => {
    it('should limit refunds on card to one page', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan1 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 1000, interval: 'day'})
      const plan2 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 2000, interval: 'week'})
      const plan3 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 3000, interval: 'month'})
      const plan4 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 4000, interval: 'year'})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, plan1.id)
      const invoiceid1 = await TestHelper.waitForNextItem(`subscription:invoices:${user.subscription.id}`, null)
      const chargeid1 = await TestHelper.waitForNextItem(`subscription:charges:${user.subscription.id}`, null)
      await TestHelper.changeSubscription(user, plan2.id)
      await TestHelper.waitForNextItem(`subscription:invoices:${user.subscription.id}`, invoiceid1)
      const chargeid2 = await TestHelper.waitForNextItem(`subscription:charges:${user.subscription.id}`, chargeid1)
      const refund1 = await TestHelper.createRefund(administrator, chargeid2)
      const refundid1 = await TestHelper.waitForNextItem(`subscription:refunds:${user.subscription.id}`, null)
      await TestHelper.createSubscription(user, plan3.id)
      const invoiceid3 = await TestHelper.waitForNextItem(`subscription:invoices:${user.subscription.id}`, null)
      const chargeid3 = await TestHelper.waitForNextItem(`subscription:charges:${user.subscription.id}`, null)
      await TestHelper.changeSubscription(user, plan4.id)
      await TestHelper.waitForNextItem(`subscription:invoices:${user.subscription.id}`, invoiceid3)
      const chargeid4 = await TestHelper.waitForNextItem(`subscription:charges:${user.subscription.id}`, chargeid3)
      const refund2 = await TestHelper.createRefund(administrator, chargeid4)
      await TestHelper.waitForNextItem(`subscription:refunds:${user.subscription.id}`, refundid1)
      const req = TestHelper.createRequest(`/api/user/subscriptions/card-refunds?cardid=${user.card.id}`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const refunds = await req.route.api.get(req)
      assert.equal(refunds.length, 2)
      assert.equal(refunds[0].id, refund2.id)
      assert.equal(refunds[1].id, refund1.id)
    })
  })
})
