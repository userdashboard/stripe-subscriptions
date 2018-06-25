/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe(`/account/subscriptions/cards`, async () => {
  describe('Cards#BEFORE', () => {
    it('should bind cards to req', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 1000, trial_period_days: 0})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
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
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 1000, trial_period_days: 0})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
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

    // it('should limit cards to one page', async () => {
    //   const user = await TestHelper.createUser()
    //   for (let i = 0, len = 10; i < len; i++) {
    //     await TestHelper.createResetCode(user)
    //   }
    //   const req = TestHelper.createRequest('/account/subscriptions/cards', 'GET')
    //   req.account = user.account
    //   req.session = user.session
    //   req.customer = user.customer
    //   const res = TestHelper.createResponse()
    //   res.end = async (str) => {
    //     const doc = TestHelper.extractDoc(str)
    //     assert.notEqual(null, doc)
    //     const table = doc.getElementById('reset-codes-table')
    //     const rows = table.getElementsByTagName('tr')
    //     assert.equal(rows.length, global.PAGE_SIZE + 1)
    //   }
    //   return req.route.api.get(req, res)
    // })

    // it('should enforce page size', async () => {
    //   const user = await TestHelper.createUser()
    //   for (let i = 0, len = 10; i < len; i++) {
    //     await TestHelper.createResetCode(user)
    //   }
    //   const req = TestHelper.createRequest('/account/subscriptions/cards', 'GET')
    //   req.account = user.account
    //   req.session = user.session
    //   req.customer = user.customer
    //   global.PAGE_SIZE = 8
    //   const res = TestHelper.createResponse()
    //   res.end = async (str) => {
    //     const doc = TestHelper.extractDoc(str)
    //     assert.notEqual(null, doc)
    //     const table = doc.getElementById('reset-codes-table')
    //     const rows = table.getElementsByTagName('tr')
    //     assert.equal(rows.length, global.PAGE_SIZE + 1)
    //   }
    //   return req.route.api.get(req, res)
    // })

    // it('should enforce specified offset', async () => {
    //   const user = await TestHelper.createUser()
    //   const codes = [ user.code ]
    //   for (let i = 0, len = 10; i < len; i++) {
    //     await TestHelper.createResetCode(user)
    //     codes.unshift(user.code)
    //   }
    //   const req = TestHelper.createRequest('/account/subscriptions/cards?offset=10', 'GET')
    //   req.account = user.account
    //   req.session = user.session
    //   req.customer = user.customer
    //   const res = TestHelper.createResponse()
    //   res.end = async (str) => {
    //     const doc = TestHelper.extractDoc(str)
    //     assert.notEqual(null, doc)
    //     for (let i = 0, len = 10; i < len; i++) {
    //       assert.notEqual(null, doc.getElementById(codes[global.PAGE_SIZE + i].codeid))
    //     }
    //   }
    //   return req.route.api.get(req, res)
    // })
  })
})
