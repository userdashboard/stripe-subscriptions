/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/administrator/subscriptions/customer-cards', () => {
  describe('CustomerCards#GET', () => {
    it('should limit cards on customer to one page', async () => {
      const administrator = await TestHelper.createAdministrator()
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      const card2 = await TestHelper.createCard(user)
      const card3 = await TestHelper.createCard(user)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/customer-cards?customerid=${user.customer.id}`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      const cards = await req.route.api.get(req)
      assert.equal(cards.length, 2)
      assert.equal(cards[0].id, card3.id)
      assert.equal(cards[1].id, card2.id)
    })
  })
})
