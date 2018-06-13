/* eslint-env mocha */
const assert = require('assert')
const RequirePayment = require('./require-payment.js')
const TestHelper = require('../test-helper.js')

describe('server/require-payment', async () => {
  describe('RequirePayment#AFTER', () => {
    it('should require customer', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/home`, 'GET')
      req.account = user.account
      req.session = user.session
      let errorMessage
      try {
        await RequirePayment.after(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-customerid')
    })

    it('should allow non-owing customer through', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      const req = TestHelper.createRequest(`/home`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const res = TestHelper.createResponse()
      res.end = (str) => {}
      await RequirePayment.after(req, res)
      assert.notEqual(true, req.redirect)
    })

    it('should allow owing customer access to /account/*', async () => {
      const administrator = await TestHelper.createAdministrator()
      const plan1 = await TestHelper.createPlan(administrator, {published: true}, {}, 1000, 0)
      const plan2 = await TestHelper.createPlan(administrator, {published: true}, {}, 2000, 0)
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, plan1.id)
      await TestHelper.changeSubscription(user, plan2.id)
      const req = TestHelper.createRequest(`/account/change-username`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const res = TestHelper.createResponse()
      res.end = (str) => {}
      await RequirePayment.after(req, res)
      assert.notEqual(true, req.redirect)
    })

    it('should allow owing administrator access to /administrator/', async () => {
      const administrator = await TestHelper.createAdministrator()
      const plan1 = await TestHelper.createPlan(administrator, {published: true}, {}, 1000, 0)
      const plan2 = await TestHelper.createPlan(administrator, {published: true}, {}, 2000, 0)
      await TestHelper.createSubscription(administrator, plan1.id)
      await TestHelper.changeSubscription(administrator, plan2.id)
      const req = TestHelper.createRequest(`/administrator/subscriptions/charges`, 'GET')
      req.account = administrator.account
      req.session = administrator.session
      const res = TestHelper.createResponse()
      res.end = (str) => {}
      await RequirePayment.after(req, res)
      assert.notEqual(true, req.redirect)
    })

    it('should redirect owing customer to the payment form', async () => {
      const administrator = await TestHelper.createAdministrator()
      const plan1 = await TestHelper.createPlan(administrator, {published: true}, {}, 1000, 0)
      const plan2 = await TestHelper.createPlan(administrator, {published: true}, {}, 2000, 0)
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, plan1.id)
      await TestHelper.changeSubscription(user, plan2.id)
      const req = TestHelper.createRequest(`/home`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const res = TestHelper.createResponse()
      let responseEnded = false
      res.end = (str) => {
        responseEnded = true
      }
      await RequirePayment.after(req, res)
      assert.equal(true, req.redirect)
      assert.equal(true, responseEnded)
    })
  })
})
