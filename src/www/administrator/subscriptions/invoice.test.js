/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')
const TestStripeAccounts = require('../../../../test-stripe-accounts.js')

describe('/administrator/subscriptions/invoice', function () {
  this.timeout(30 * 60 * 1000)
  afterEach(TestHelper.deleteOldWebhooks)
  beforeEach(TestHelper.setupWebhook)
  describe('before', () => {
    it('should reject invalid invoiceid', async () => {
      const administrator = await TestHelper.createOwner()
      const req = TestHelper.createRequest('/administrator/subscriptions/invoice?invoiceid=invalid')
      req.account = administrator.account
      req.session = administrator.session
      let errorMessage
      try {
        await req.route.api.before(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-invoiceid')
    })

    it('should bind data to req', async () => {
      const administrator = await TestStripeAccounts.createOwnerWithPlan()
      const user = await TestStripeAccounts.createUserWithPaymentMethod()
      await TestHelper.createSubscription(user, administrator.plan.id)
      const req = TestHelper.createRequest(`/administrator/subscriptions/invoice?invoiceid=${user.invoice.id}`)
      req.account = administrator.account
      req.session = administrator.session
      await req.route.api.before(req)
      assert.strictEqual(req.data.invoice.id, user.invoice.id)
    })
  })

  describe('view', () => {
    it('should present the invoice table (screenshots)', async () => {
      const administrator = await TestStripeAccounts.createOwnerWithPlan()
      const user = await TestStripeAccounts.createUserWithPaymentMethod()
      await TestHelper.createSubscription(user, administrator.plan.id)
      const req = TestHelper.createRequest(`/administrator/subscriptions/invoice?invoiceid=${user.invoice.id}`)
      req.account = administrator.account
      req.session = administrator.session
      req.filename = __filename
      req.screenshots = [
        { hover: '#administrator-menu-container' },
        { click: '/administrator/subscriptions' },
        { click: '/administrator/subscriptions/invoices' },
        { click: `/administrator/subscriptions/invoice?invoiceid=${user.invoice.id}` }
      ]
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      const tbody = doc.getElementById(user.invoice.id)
      assert.strictEqual(tbody.tag, 'tbody')
    })
  })
})
