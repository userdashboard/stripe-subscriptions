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
  })
})
