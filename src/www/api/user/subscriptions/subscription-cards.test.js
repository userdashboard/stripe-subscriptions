/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/user/subscriptions/subscription-cards', () => {
  describe('SubscriptionCards#GET', () => {
    it('should limit cards to one page', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan1 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 10000, interval: 'day'})
      const plan2 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 20000, interval: 'week'})
      const plan3 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 30000, interval: 'month'})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, plan1.id)
      const invoiceid1 = await TestHelper.waitForNextItem(`subscription:invoices:${user.subscription.id}`, null)
      const chargeid1 = await TestHelper.waitForNextItem(`subscription:charges:${user.subscription.id}`, null)
      const card2 = await TestHelper.createCard(user)
      await TestHelper.changeSubscription(user, plan2.id)
      const invoiceid2 = await TestHelper.waitForNextItem(`subscription:invoices:${user.subscription.id}`, invoiceid1)
      const chargeid2 = await TestHelper.waitForNextItem(`subscription:charges:${user.subscription.id}`, chargeid1)
      const card3 = await TestHelper.createCard(user)
      await TestHelper.changeSubscription(user, plan3.id)
      await TestHelper.waitForNextItem(`subscription:invoices:${user.subscription.id}`, invoiceid2)
      await TestHelper.waitForNextItem(`subscription:charges:${user.subscription.id}`, chargeid2)
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
      const intervals = ['day', 'week', 'month', 'year', 'day', 'week', 'month', 'year']
      const plan1 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 100, interval: intervals[0]})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, plan1.id)
      let invoiceid = await TestHelper.waitForNextItem(`subscription:invoices:${user.subscription.id}`, null)
      let chargeid = await TestHelper.waitForNextItem(`subscription:charges:${user.subscription.id}`, null)
      for (let i = 0, len = global.PAGE_SIZE + 1; i < len; i++) {
        const amount = 1000 * (i + 1)
        const newPlan = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount, interval: intervals[i+1]})
        await TestHelper.createCard(user)
        await TestHelper.changeSubscription(user, newPlan.id)
        invoiceid = await TestHelper.waitForNextItem(`subscription:invoices:${user.subscription.id}`, invoiceid)
        chargeid = await TestHelper.waitForNextItem(`subscription:charges:${user.subscription.id}`, chargeid)
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
      const intervals = ['day', 'week', 'month', 'year', 'day', 'week', 'month', 'year']
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 100, interval: intervals[0]})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, administrator.plan.id)
      let invoiceid = await TestHelper.waitForNextItem(`subscription:invoices:${user.subscription.id}`, null)
      let chargeid = await TestHelper.waitForNextItem(`subscription:charges:${user.subscription.id}`, null)
      const cards = [ user.card ]
      for (let i = 0, len = offset + global.PAGE_SIZE + 1; i < len; i++) {
        const amount = 1000 * (i + 1)
        const newPlan = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount, interval: intervals[i + 1]})
        await TestHelper.createCard(user)
        await TestHelper.changeSubscription(user, newPlan.id)
        cards.unshift(user.card)
        invoiceid = await TestHelper.waitForNextItem(`subscription:invoices:${user.subscription.id}`, invoiceid)
        chargeid = await TestHelper.waitForNextItem(`subscription:charges:${user.subscription.id}`, chargeid)
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
