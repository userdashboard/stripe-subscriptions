/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/user/subscriptions/create-customer', () => {
  describe('exceptions', () => {
    describe('invalid-accountid', () => {
      it('missing querystring accountid', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/subscriptions/create-customer')
        req.account = user.account
        req.session = user.session
        req.body = {
          email: user.profile.contactEmail,
          description: 'customer'
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-accountid')
      })

      it('invalid querystring accountid', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/subscriptions/create-customer?accountid=invalid')
        req.account = user.account
        req.session = user.session
        req.body = {
          email: user.profile.contactEmail,
          description: 'customer'
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-accountid')
      })
    })

    describe('invalid-account', () => {
      it('ineligible accessing account', async () => {
        const user = await TestHelper.createUser()
        const user2 = await TestHelper.createUser()
        const req = TestHelper.createRequest(`/api/user/subscriptions/create-customer?accountid=${user2.account.accountid}`)
        req.account = user.account
        req.session = user.session
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-account')
      })
    })
  })

  describe('returns', () => {
    it('object', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/subscriptions/create-customer?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        email: user.profile.contactEmail,
        description: 'customer'
      }
      req.filename = __filename
      req.saveResponse = true
      const customer = await req.post()
      assert.strictEqual(customer.object, 'customer')
    })
  })
})
