/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')
const TestStripeAccounts = require('../../../../test-stripe-accounts.js')

describe('/administrator/subscriptions/payment-intent', function () {
  describe('before', () => {
    it('should reject invalid paymentintentid', async () => {
      const administrator = await TestHelper.createOwner()
      const req = TestHelper.createRequest('/administrator/subscriptions/payment-intent?paymentintentid=invalid')
      req.account = administrator.account
      req.session = administrator.session
      let errorMessage
      try {
        await req.route.api.before(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-paymentintentid')
    })

    it('should bind data to req', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestStripeAccounts.createUserWithPaymentMethod()
      const paymentIntent = await TestHelper.createPaymentIntent(user, {
        paymentmethodid: user.paymentMethod.id,
        amount: 10000,
        currency: 'usd'
      })
      const req = TestHelper.createRequest(`/administrator/subscriptions/payment-intent?paymentintentid=${paymentIntent.id}`)
      req.account = administrator.account
      req.session = administrator.session
      await req.route.api.before(req)
      assert.strictEqual(req.data.paymentIntent.id, paymentIntent.id)
    })
  })

  describe('view', () => {
    it('should have row for payment intent (screenshots)', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestStripeAccounts.createUserWithPaymentMethod()
      const paymentIntent = await TestHelper.createPaymentIntent(user, {
        paymentmethodid: user.paymentMethod.id,
        amount: 10000,
        currency: 'usd'
      })
      const req = TestHelper.createRequest(`/administrator/subscriptions/payment-intent?paymentintentid=${paymentIntent.id}`)
      req.account = administrator.account
      req.session = administrator.session
      req.filename = __filename
      req.screenshots = [
        { hover: '#administrator-menu-container' },
        { click: '/administrator/subscriptions' },
        { click: '/administrator/subscriptions/payment-intents' },
        { click: `/administrator/subscriptions/payment-intent?paymentintentid=${paymentIntent.id}` }
      ]
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      const tbody = doc.getElementById(paymentIntent.id)
      assert.strictEqual(tbody.tag, 'tbody')
    })
  })
})
