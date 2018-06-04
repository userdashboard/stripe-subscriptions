/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../test-helper.js')

describe(`/account/subscriptions/card`, async () => {
  describe('Card#BEFORE', () => {
    it('should reject invalid card', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user, false)
      const req = TestHelper.createRequest('/account/subscriptions/card?cardid=invalid', 'POST')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      let errorMessage
      try {
        await req.route.api.before(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-cardid')
    })

    it('should reject other account\'s card', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true}, {}, 1000, 0)
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, administrator.plan.id)
      const user2 = await TestHelper.createUser()
      await TestHelper.createCustomer(user2, false)
      const req = TestHelper.createRequest(`/account/subscriptions/card?cardid=${user.card.id}`, 'POST')
      req.account = user2.account
      req.session = user2.session
      req.customer = user2.customer
      let errorMessage
      try {
        await req.route.api.before(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-cardid')
    })

    it('should bind card to req', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true}, {}, 1000, 0)
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, administrator.plan.id)
      const req = TestHelper.createRequest(`/account/subscriptions/cards`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      await req.route.api.before(req)
      assert.notEqual(req.data, null)
      assert.notEqual(req.data.cards, null)
      assert.equal(req.data.cards.length, 1)
    })
  })

  describe('Card#GET', () => {
    it('should have row for card', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true}, {}, 1000, 0)
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, administrator.plan.id)
      const card1 = user.card
      await TestHelper.createCard(user)
      const card2 = user.card
      const req = TestHelper.createRequest('/account/subscriptions/cards', 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        assert.notEqual(null, doc)
        const card1Row = doc.getElementById(card1.id)
        assert.notEqual(null, card1Row)
        const card2Row = doc.getElementById(card2.id)
        assert.notEqual(null, card2Row)
      }
      return req.route.api.get(req, res)
    })
  })
})
