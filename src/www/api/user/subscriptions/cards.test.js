/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/user/subscriptions/cards', () => {
  describe('Cards#GET', () => {
    it('should limit cards to one page', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      const card2 = await TestHelper.createCard(user)
      const card3 = await TestHelper.createCard(user)
      const req = TestHelper.createRequest(`/api/user/subscriptions/cards?customerid=${user.customer.id}`, 'GET')
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
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      for (let i = 0, len = global.PAGE_SIZE + 1; i < len; i++) {
        await TestHelper.createCard(user)
      }
      const req = TestHelper.createRequest(`/api/user/subscriptions/cards?customerid=${user.customer.id}`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const cardsNow = await req.route.api.get(req)
      assert.equal(cardsNow.length, global.PAGE_SIZE)
    })

    it('should enforce specified offset', async () => {
      const offset = 1
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      const cards = []
      for (let i = 0, len = offset + global.PAGE_SIZE + 1; i < len; i++) {
        const card = await TestHelper.createCard(user)
        cards.unshift(card)
      }
      const req = TestHelper.createRequest(`/api/user/subscriptions/cards?customerid=${user.customer.id}&offset=${offset}`, 'GET')
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
