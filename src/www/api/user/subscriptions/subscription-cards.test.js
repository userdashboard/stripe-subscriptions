/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/user/subscriptions/subscription-cards', () => {
  describe('SubscriptionCards#GET', () => {
    it('should limit cards to one page', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan1 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 10000})
      const plan2 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 20000})
      const plan3 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 30000})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, plan1.id)
      await TestHelper.waitForNextItem(`subscription:invoices:${user.subscription.id}`, null)
      const card2 = await TestHelper.createCard(user)
      await TestHelper.changeSubscription(user, plan2.id)
      const card3 = await TestHelper.createCard(user)
      await TestHelper.changeSubscription(user, plan3.id)
      const req = TestHelper.createRequest(`/api/user/subscriptions/subscription-cards?subscriptionid=${user.subscription.id}`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const cards = await req.route.api.get(req)
      assert.equal(cards.length, 2)
      assert.equal(cards[0].id, card3.id)
      assert.equal(cards[1].id, card2.id)
    })

    it('should enforce page size', async () => {
      global.PAGE_SIZE = 3
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan1 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 10000})
      
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, plan1.id)
      for (let i = 0, len = global.PAGE_SIZE + 1; i < len; i++) {
        const newPlan = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 1000})
        await TestHelper.createCard(user)
        await TestHelper.changeSubscription(user, newPlan.id)
      }
      const req = TestHelper.createRequest(`/api/user/subscriptions/subscription-cards?subscriptionid=${user.subscription.id}`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const cardsNow = await req.route.api.get(req)
      assert.equal(cardsNow.length, global.PAGE_SIZE)
    })

    it('should enforce specified offset', async () => {
      const offset = 1
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 1000})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, administrator.plan.id)
      const cards = [ user.card ]
      for (let i = 0, len = offset + global.PAGE_SIZE + 1; i < len; i++) {
        const newPlan = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 1000})
        await TestHelper.createCard(user)
        await TestHelper.changeSubscription(user, newPlan.id)
        cards.unshift(user.card)
      }
      const req = TestHelper.createRequest(`/api/user/subscriptions/subscription-cards?subscriptionid=${user.subscription.id}&offset=${offset}`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const cardsNow = await req.route.api.get(req)
      for (let i = 0, len = global.PAGE_SIZE; i < len; i++) {
        assert.equal(cardsNow[i].id, cards[offset + i].id)
      }
    })
  })
})
