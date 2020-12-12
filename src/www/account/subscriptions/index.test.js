/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')
const TestStripeAccounts = require('../../../../test-stripe-accounts.js')
const DashboardTestHelper = require('@userdashboard/dashboard/test-helper.js')

describe('/account/subscriptions', function () {
  const cachedResponses = {}
  const cachedInvoices = []
  const cachedSubscriptions = []
  const cachedCustomers = []
  after(TestHelper.deleteOldWebhooks)
  before(async () => {
    await DashboardTestHelper.setupBeforeEach()
    await TestHelper.setupBeforeEach()
    await TestHelper.setupWebhook()
    global.delayDiskWrites = true
    const administrator = await TestStripeAccounts.createOwnerWithPlan()
    let user = await TestStripeAccounts.createUserWithPaymentMethod()
    await TestHelper.createSubscription(user, administrator.plan.id)
    cachedInvoices.unshift(user.invoice.id)
    cachedSubscriptions.unshift(user.subscription.id)
    cachedCustomers.unshift(user.customer.id)
    await TestHelper.createProduct(administrator, {
      published: true
    })
    await TestHelper.createPlan(administrator, {
      productid: administrator.product.id,
      published: true,
      amount: 1000,
      interval: 'month',
      usage_type: 'licensed'
    })

    await TestHelper.deleteOldWebhooks()
    await TestHelper.setupWebhook()
    user = await TestStripeAccounts.createUserWithPaymentMethod(user)
    await TestHelper.createSubscription(user, administrator.plan.id)
    cachedInvoices.unshift(user.invoice.id)
    cachedSubscriptions.unshift(user.subscription.id)
    cachedCustomers.unshift(user.customer.id)
    const req1 = TestHelper.createRequest('/account/subscriptions')
    req1.account = user.account
    req1.session = user.session
    req1.filename = __filename
    req1.screenshots = [
      { hover: '#account-menu-container' },
      { click: '/account/subscriptions' }
    ]
    await req1.route.api.before(req1)
    cachedResponses.before = req1.data
    cachedResponses.returns = await req1.get()
  })
  describe('before', () => {
    it('should bind data to req', async () => {
      const data = cachedResponses.before
      assert.strictEqual(data.customers.length, cachedCustomers.length)
      assert.strictEqual(data.subscriptions.length, cachedSubscriptions.length)
      assert.strictEqual(data.invoices.length, cachedInvoices.length)
    })
  })

  describe('view', () => {
    it('should have row for each invoice', async () => {
      const result = cachedResponses.returns
      const doc = TestHelper.extractDoc(result.html)
      const invoice1Row = doc.getElementById(cachedInvoices[0])
      const invoice2Row = doc.getElementById(cachedInvoices[1])
      assert.strictEqual(invoice1Row.tag, 'tr')
      assert.strictEqual(invoice2Row.tag, 'tr')
    })

    it('should have row for each customer', async () => {
      const result = cachedResponses.returns
      const doc = TestHelper.extractDoc(result.html)
      const customer1Row = doc.getElementById(cachedCustomers[0])
      const customer2Row = doc.getElementById(cachedCustomers[1])
      assert.strictEqual(customer1Row.tag, 'tr')
      assert.strictEqual(customer2Row.tag, 'tr')
    })

    it('should have row for each subscription', async () => {
      const result = cachedResponses.returns
      const doc = TestHelper.extractDoc(result.html)
      const subscription1Row = doc.getElementById(cachedSubscriptions[0])
      const subscription2Row = doc.getElementById(cachedSubscriptions[1])
      assert.strictEqual(subscription1Row.tag, 'tr')
      assert.strictEqual(subscription2Row.tag, 'tr')
    })
  })
})
