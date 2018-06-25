/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe(`/api/user/subscriptions/create-card`, () => {
  describe('CreateCard#POST', () => {
    it('should require name, cvc, number, exp_month and exp_year', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      const req = TestHelper.createRequest(`/api/user/subscriptions/create-card?customerid=${user.customer.id}`, 'POST')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      req.body = {
        name: 'Tester',
        cvc: '111',
        number: '4111111111111111',
        exp_month: '1',
        exp_year: (new Date().getFullYear() + 1).toString()
      }
      for (const field of ['name', 'cvc', 'number', 'exp_month', 'exp_year']) {
        const value = req.body[field]
        req.body[field] = null
        let errorMessage
        try {
          await req.route.api.post(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.equal(errorMessage, `invalid-${field}`)
        req.body[field] = value
      }
    })

    it('should create card', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      const req = TestHelper.createRequest(`/api/user/subscriptions/create-card?customerid=${user.customer.id}`, 'POST')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      req.body = {
        name: 'Test person',
        cvc: '111',
        number: '4111-1111-1111-1111',
        exp_month: '1',
        exp_year: (new Date().getFullYear() + 1).toString(),
        address_line1: 'A street address',
        address_city: 'City',
        address_state: 'California',
        address_zip: '90120',
        address_country: 'US'
      }
      await req.route.api.post(req)
      req.session = await TestHelper.unlockSession(user)
      const card = await req.route.api.post(req)
      assert.equal(card.id, req.customer.default_source)
    })
  })
})
