/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/user/subscriptions/product-cards', () => {
  describe('ProductCards#GET', () => {
    it('should limit cards to one page', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 10000})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, administrator.plan.id)
      await TestHelper.waitForNextItem(`subscription:charges:${user.subscription.id}`, null)
      const card2 = await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, administrator.plan.id)
      await TestHelper.waitForNextItem(`subscription:charges:${user.subscription.id}`, null)
      const card3 = await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, administrator.plan.id)
      await TestHelper.waitForNextItem(`subscription:charges:${user.subscription.id}`, null)
      const req = TestHelper.createRequest(`/api/user/subscriptions/product-cards?productid=${product.id}`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const cards = await req.route.api.get(req)
      assert.equal(cards.length, 2)
      assert.equal(cards[0].id, card3.id)
      assert.equal(cards[1].id, card2.id)
    })

    it('should enforce page size', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 10000})
      global.PAGE_SIZE = 3
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      for (let i = 0, len = global.PAGE_SIZE + 1; i < len; i++) {
        await TestHelper.createCard(user)
        await TestHelper.createSubscription(user, administrator.plan.id)
        await TestHelper.waitForNextItem(`subscription:charges:${user.subscription.id}`, null)
      }
      const req = TestHelper.createRequest(`/api/user/subscriptions/product-cards?productid=${product.id}`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const cardsNow = await req.route.api.get(req)
      assert.equal(cardsNow.length, global.PAGE_SIZE)
    })

    it('should enforce specified offset', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 10000})
      const offset = 1
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      const cards = []
      for (let i = 0, len = offset + global.PAGE_SIZE + 1; i < len; i++) {
        const card = await TestHelper.createCard(user)
        await TestHelper.createSubscription(user, administrator.plan.id)
        cards.unshift(card)
        await TestHelper.waitForNextItem(`subscription:charges:${user.subscription.id}`, null)
      }
      const req = TestHelper.createRequest(`/api/user/subscriptions/product-cards?productid=${product.id}&offset=${offset}`, 'GET')
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
