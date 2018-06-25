/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe(`/api/user/subscriptions/delete-card`, () => {
  describe('DeleteCard#DELETE', () => {
    it('should reject invalid cardid', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/subscriptions/delete-card?cardid=invalid`, 'DELETE')
      req.account = user.account
      req.session = user.session
      let errorMessage
      try {
        await req.route.api.delete(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-cardid')
    })

    it('should reject other account\'s card', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      const user2 = await TestHelper.createUser()
      await TestHelper.createCustomer(user2)
      await TestHelper.createCard(user2)
      const req = TestHelper.createRequest(`/api/user/subscriptions/delete-card?cardid=${user.card.id}`, 'DELETE')
      req.account = user2.account
      req.session = user2.session
      req.customer = user2.customer
      let errorMessage
      try {
        await req.route.api.delete(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-cardid')
    })

    it('should delete card', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      const req = TestHelper.createRequest(`/api/user/subscriptions/delete-card?cardid=${user.card.id}`, 'DELETE')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      await req.route.api.delete(req)
      req.session = await TestHelper.unlockSession(user)
      await req.route.api.delete(req)
      assert.equal(req.success, true)
    })
  })
})
