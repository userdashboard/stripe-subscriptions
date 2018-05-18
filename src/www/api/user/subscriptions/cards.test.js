/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/user/subscriptions/cards', () => {
  describe('Cards#GET', () => {
    it('should return card list', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user, true)
      const req = TestHelper.createRequest(`/api/user/subscriptions/cards`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const cards = await req.route.api.get(req)
      assert.equal(cards.length, 1)
      assert.equal(cards[0].id, user.card.id)
    })
  })
})
