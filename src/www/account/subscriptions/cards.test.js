/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe(`/account/subscriptions/cards`, async () => {
  describe('Cards#BEFORE', () => {
    it('should bind cards to req', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      const card2 = await TestHelper.createCard(user)
      const card3 = await TestHelper.createCard(user)
      const req = TestHelper.createRequest(`/account/subscriptions/cards`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      await req.route.api.before(req)
      assert.equal(req.data.cards.length, 2)
      assert.equal(req.data.cards[0].id, card3.id)
      assert.equal(req.data.cards[1].id, card2.id)
    })
  })

  describe('Cards#GET', () => {
    it('should enforce page size', async () => {
      global.PAGE_SIZE = 3
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      for (let i = 0, len = global.PAGE_SIZE + 1; i < len; i++) {
        await TestHelper.createCard(user)
      }
      const req = TestHelper.createRequest('/account/subscriptions/cards', 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        assert.notEqual(null, doc)
        const table = doc.getElementById('cards-table')
        const rows = table.getElementsByTagName('tr')
        assert.equal(rows.length, global.PAGE_SIZE + 1)
      }
      return req.route.api.get(req, res)
    })

    it('should enforce specified offset', async () => {
      const offset = 1
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      const cards = []
      for (let i = 0, len = global.PAGE_SIZE + offset + 1; i < len; i++) {
        await TestHelper.createCard(user)
        cards.unshift(user.card)
      }
      const req = TestHelper.createRequest(`/account/subscriptions/cards?offset=${offset}`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        assert.notEqual(null, doc)
        for (let i = 0, len = global.PAGE_SIZE; i < len; i++) {
          assert.notEqual(null, doc.getElementById(cards[offset + i].id))
        }
      }
      return req.route.api.get(req, res)
    })
  })
})
