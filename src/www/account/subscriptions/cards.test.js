/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../test-helper.js')

describe(`/account/subscriptions/cards`, async () => {
  describe('Cards#BEFORE', () => {
    it('should bind cards to req', async () => {
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

  describe('Cards#GET', () => {
    it('should have row for each card', async () => {
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
