/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')
const TestStripeAccounts = require('../../../../test-stripe-accounts.js')
const DashboardTestHelper = require('@userdashboard/dashboard/test-helper.js')

describe('/account/subscriptions/invoice', function () {
  this.timeout(60 * 60 * 1000)
  after(TestHelper.deleteOldWebhooks)
  const cachedResponses = {}
  let cachedInvoice
  before(async () => {
    await DashboardTestHelper.setupBeforeEach()
    await TestHelper.setupBeforeEach()
    await TestHelper.setupWebhook()
    global.delayDiskWrites = true
    const administrator = await TestHelper.createOwner()
    await TestHelper.createProduct(administrator, {
      published: 'true'
    })
    const user = await TestStripeAccounts.createUserWithPaymentMethod()
    await TestHelper.createPlan(administrator, {
      productid: administrator.product.id,
      usage_type: 'licensed',
      published: 'true',
      amount: '100000',
      trial_period_days: '0'
    })
    await TestHelper.createSubscription(user, administrator.plan.id)
    cachedInvoice = user.invoice
    const req1 = TestHelper.createRequest(`/account/subscriptions/invoice?invoiceid=${user.invoice.id}`)
    req1.account = user.account
    req1.session = user.session
    req1.filename = __filename
    req1.screenshots = [
      { hover: '#account-menu-container' },
      { click: '/account/subscriptions' },
      { click: '/account/subscriptions/invoices' },
      { click: `/account/subscriptions/invoice?invoiceid=${user.invoice.id}` }
    ]
    await req1.route.api.before(req1)
    cachedResponses.before = req1.data
    cachedResponses.returns = await req1.get()
    const user2 = await TestHelper.createUser()
    const req2 = TestHelper.createRequest(`/account/subscriptions/invoice?invoiceid=${user.invoice.id}`)
    req2.account = user2.account
    req2.session = user2.session
    try {
      await req2.route.api.before(req2)
    } catch (error) {
      cachedResponses.invalidAccount = error.message
    }
  })
  describe('exceptions', () => {
    it('invalid-invoiceid', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/subscriptions/invoice?invoiceid=invalid')
      req.account = user.account
      req.session = user.session
      let errorMessage
      try {
        await req.route.api.before(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-invoiceid')
    })

    it('invalid-account', async () => {
      const errorMessage = cachedResponses.invalidAccount
      assert.strictEqual(errorMessage, 'invalid-account')
    })
  })

  describe('before', () => {
    it('should bind data to req', async () => {
      const data = cachedResponses.before
      assert.strictEqual(data.invoice.id, cachedInvoice.id)
    })
  })

  describe('view', () => {
    it('should have row for invoice (screenshots)', async () => {
      const result = cachedResponses.returns
      const doc = TestHelper.extractDoc(result.html)
      const tbody = doc.getElementById(cachedInvoice.id)
      assert.strictEqual(tbody.tag, 'tbody')
    })
  })
})
