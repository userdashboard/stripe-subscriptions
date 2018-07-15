/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/user/subscriptions/card-charges', () => {
  describe('CardCharges#GET', () => {
    it('should limit card\'s charges to one page', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      for (let i = 0, len = global.PAGE_SIZE + 1; i < len; i++) {
        const plan = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 1000})
        await TestHelper.createSubscription(user, plan.id)
        await TestHelper.waitForNextItem(`subscription:charges:${user.subscription.id}`, null)
      }
      const req = TestHelper.createRequest(`/api/user/subscriptions/card-charges?cardid=${user.card.id}`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const chargesNow = await req.route.api.get(req)
      assert.equal(chargesNow.length, 2)
    })

    it('should enforce page size', async () => {
      global.PAGE_SIZE = 3
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      for (let i = 0, len = global.PAGE_SIZE + 1; i < len; i++) {
        const plan = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 1000})
        await TestHelper.createSubscription(user, plan.id)
        await TestHelper.waitForNextItem(`subscription:charges:${user.subscription.id}`, null)
      }
      const req = TestHelper.createRequest(`/api/user/subscriptions/card-charges?cardid=${user.card.id}`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const chargesNow = await req.route.api.get(req)
      assert.equal(chargesNow.length, global.PAGE_SIZE)
    })

    it('should enforce specified offset', async () => {
      const offset = 1
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      const charges = []
      for (let i = 0, len = global.PAGE_SIZE + offset + 1; i < len; i++) {
        const plan = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 1000})
        await TestHelper.createSubscription(user, plan.id)
        const chargeid = await TestHelper.waitForNextItem(`subscription:charges:${user.subscription.id}`, null)
        charges.unshift(chargeid)
      }
      const req = TestHelper.createRequest(`/api/user/subscriptions/card-charges?cardid=${user.card.id}&offset=${offset}`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const chargesNow = await req.route.api.get(req)
      for (let i = 0, len = global.PAGE_SIZE; i < len; i++) {
        assert.equal(chargesNow[i].id, charges[offset + i])
      }
    })
  })
})
