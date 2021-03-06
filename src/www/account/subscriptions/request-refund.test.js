/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')
const TestStripeAccounts = require('../../../../test-stripe-accounts.js')
const DashboardTestHelper = require('@userdashboard/dashboard/test-helper.js')

describe('/account/subscriptions/request-refund', function () {
  after(TestHelper.deleteOldWebhooks)
  const cachedResponses = {}
  let cachedUser
  before(async () => {
    await DashboardTestHelper.setupBeforeEach()
    await TestHelper.setupBeforeEach()
    await TestHelper.setupWebhook()
    global.delayDiskWrites = true
    global.subscriptionRefundPeriod = 0
    const administrator = await TestHelper.createOwner()
    await TestHelper.createProduct(administrator, {
      published: 'true'
    })
    const user = cachedUser = await TestStripeAccounts.createUserWithPaymentMethod()
    await TestHelper.createPlan(administrator, {
      productid: administrator.product.id,
      usage_type: 'licensed',
      published: 'true',
      amount: '100000',
      trial_period_days: '0'
    })
    await TestHelper.createSubscription(user, administrator.plan.id)
    await TestHelper.deleteOldWebhooks()
    await TestHelper.setupWebhook()
    const req = TestHelper.createRequest(`/account/subscriptions/request-refund?invoiceid=${user.invoice.id}`)
    req.account = user.account
    req.session = user.session
    req.filename = __filename
    req.screenshots = [
      { hover: '#account-menu-container' },
      { click: '/account/subscriptions' },
      { click: '/account/subscriptions/invoices' },
      { click: `/account/subscriptions/invoice?invoiceid=${user.invoice.id}` },
      { click: `/account/subscriptions/request-refund?invoiceid=${user.invoice.id}` },
      { fill: '#submit-form' }
    ]
    await req.route.api.before(req)
    cachedResponses.before = req.data
    req.body = {
      reason: 'this is a reason'
    }
    cachedResponses.submit = await req.post()
    const req2 = TestHelper.createRequest(`/account/subscriptions/request-refund?invoiceid=${user.invoice.id}`)
    req2.account = user.account
    req2.session = user.session
    cachedResponses.returns = await req2.get()
    const user2 = await TestHelper.createUser()
    req2.account = user2.account
    req2.session = user2.session
    try {
      await req2.route.api.before(req2)
    } catch (error) {
      cachedResponses.invalidAccount = error.message
    }
  })
  describe('exceptions', () => {
    it('invalid-invoice', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/subscriptions/request-refund?invoiceid=invalid')
      req.account = user.account
      req.session = user.session
      req.body = {
        reason: 'this is a reason'
      }
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
      assert.strictEqual(data.invoice.id, cachedUser.invoice.id)
      assert.strictEqual(data.charge.id, cachedUser.charge.id)
    })
  })

  describe('view', () => {
    it('should present the form', async () => {
      const result = cachedResponses.returns
      const doc = TestHelper.extractDoc(result.html)
      assert.strictEqual(doc.getElementById('submit-form').tag, 'form')
      assert.strictEqual(doc.getElementById('submit-button').tag, 'button')
    })
  })

  describe('submit', () => {
    it('should create refund request (screenshots)', async () => {
      const result = cachedResponses.submit
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'success')
    })
  })
})
