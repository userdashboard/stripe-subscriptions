/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')
const TestStripeAccounts = require('../../../../test-stripe-accounts.js')

describe('/administrator/subscriptions/payment-method', function () {
  describe('before', () => {
    it('should reject invalid paymentmethodid', async () => {
      const administrator = await TestHelper.createOwner()
      const req = TestHelper.createRequest('/administrator/subscriptions/payment-method?paymentmethodid=invalid')
      req.account = administrator.account
      req.session = administrator.session
      let errorMessage
      try {
        await req.route.api.before(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-paymentmethodid')
    })

    it('should bind data to req', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestStripeAccounts.createUserWithPaymentMethod()
      const req = TestHelper.createRequest(`/administrator/subscriptions/payment-method?paymentmethodid=${user.paymentMethod.id}`)
      req.account = administrator.account
      req.session = administrator.session
      await req.route.api.before(req)
      assert.strictEqual(req.data.paymentMethod.id, user.paymentMethod.id)
    })
  })

  describe('view', () => {
    it('should have row for payment method (screenshots)', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestStripeAccounts.createUserWithPaymentMethod()
      const req = TestHelper.createRequest(`/administrator/subscriptions/payment-method?paymentmethodid=${user.paymentMethod.id}`)
      req.account = administrator.account
      req.session = administrator.session
      req.filename = __filename
      req.screenshots = [
        { hover: '#administrator-menu-container' },
        { click: '/administrator/subscriptions' },
        { click: '/administrator/subscriptions/payment-methods' },
        { click: `/administrator/subscriptions/payment-method?paymentmethodid=${user.paymentMethod.id}` }
      ]
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      const tbody = doc.getElementById(user.paymentMethod.id)
      assert.strictEqual(tbody.tag, 'tbody')
    })
  })
})
