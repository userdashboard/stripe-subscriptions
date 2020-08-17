/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')
const TestStripeAccounts = require('../../../../../test-stripe-accounts.js')

describe('/api/administrator/subscriptions/payment-method', () => {
  describe('exceptions', () => {
    describe('invalid-paymentmethodid', () => {
      it('missing querystring paymentmethodid', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/subscriptions/payment-method')
        req.account = administrator.account
        req.session = administrator.session
        let errorMessage
        try {
          await req.get()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-paymentmethodid')
      })

      it('invalid querystring paymentmethodid', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/subscriptions/payment-method?paymentmethodid=invalid')
        req.account = administrator.account
        req.session = administrator.session
        let errorMessage
        try {
          await req.get()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-paymentmethodid')
      })
    })
  })

  describe('returns', () => {
    it('object', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestStripeAccounts.createUserWithPaymentMethod()
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/payment-method?paymentmethodid=${user.paymentMethod.id}`)
      req.account = administrator.account
      req.session = administrator.session
      req.filename = __filename
      req.saveResponse = true
      const paymentMethod = await req.get()
      assert.strictEqual(paymentMethod.id, user.paymentMethod.id)
    })
  })
})
