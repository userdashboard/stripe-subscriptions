/* eslint-env mocha */
const assert = require('assert')
const RequireSubscription = require('./require-subscription.js')
const TestHelper = require('../test-helper.js')

describe('server/require-subscription', async () => {
  describe('RequireSubscription#AFTER', () => {
    it('should require customer', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/home`, 'GET')
      req.account = user.account
      req.session = user.session
      try {
        await RequireSubscription.after(req)
      } catch (error) {
        assert.equal(error.message, 'invalid-customerid')
      }
    })

    it('should allow customer without subscription access to /account/*', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      const req = TestHelper.createRequest(`/account/change-username`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const res = TestHelper.createResponse()
      res.end = (str) => {}
      await RequireSubscription.after(req, res)
      assert.notEqual(true, req.redirect)
    })

    it('should allow administrator without subscription access to /administrator/', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createCustomer(administrator)
      const req = TestHelper.createRequest(`/administrator/subscriptions/charges`, 'GET')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
      const res = TestHelper.createResponse()
      res.end = (str) => {}
      await RequireSubscription.after(req, res)
      assert.notEqual(true, req.redirect)
    })

    it('should redirect unsubscribed customer to the plans list', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      const req = TestHelper.createRequest(`/home`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const res = TestHelper.createResponse()
      let responseEnded = false
      res.end = (str) => {
        responseEnded = true
      }
      await RequireSubscription.after(req, res)
      assert.equal(true, req.redirect)
      assert.equal(true, responseEnded)
    })
  })
})
