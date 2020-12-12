/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')
const TestStripeAccounts = require('../../../../test-stripe-accounts.js')
const DashboardTestHelper = require('@userdashboard/dashboard/test-helper.js')

describe('/administrator/subscriptions/refund-charge', function () {
  const cachedResponses = {}
  let cachedCharge
  after(TestHelper.deleteOldWebhooks)
  before(async () => {
    await DashboardTestHelper.setupBeforeEach()
    await TestHelper.setupBeforeEach()
    await TestHelper.setupWebhook()
    const administrator = await TestStripeAccounts.createOwnerWithPlan()
    const user = await TestStripeAccounts.createUserWithPaymentMethod()
    await TestHelper.createSubscription(user, administrator.plan.id)
    cachedCharge = user.charge
    const req = TestHelper.createRequest(`/administrator/subscriptions/refund-charge?chargeid=${user.charge.id}`)
    req.account = administrator.account
    req.session = administrator.session
    req.body = {
      amount: '1000'
    }
    await req.route.api.before(req)
    cachedResponses.before = req.data
    cachedResponses.returns = await req.get()
    req.filename = __filename
    req.screenshots = [
      { hover: '#administrator-menu-container' },
      { click: '/administrator/subscriptions' },
      { click: '/administrator/subscriptions/charges' },
      { click: `/administrator/subscriptions/charge?chargeid=${user.charge.id}` },
      { click: `/administrator/subscriptions/refund-charge?chargeid=${user.charge.id}` },
      { fill: '#submit-form' }
    ]
    cachedResponses.submit = await req.post()
    try {
      await req.route.api.before(req)
    } catch (error) {
      cachedResponses.invalidCharge = error.message
    }
  })
  describe('exceptions', () => {
    it('should reject invalid chargeid', async () => {
      const administrator = await TestHelper.createOwner()
      const req = TestHelper.createRequest('/administrator/subscriptions/refund-charge?chargeid=invalid')
      req.account = administrator.account
      req.session = administrator.session
      let errorMessage
      try {
        await req.route.api.before(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-chargeid')
    })

    it('should reject refunded charge', async () => {
      const errorMessage = cachedResponses.invalidCharge
      assert.strictEqual(errorMessage, 'invalid-charge')
    })
  })

  describe('before', () => {
    it('should bind data to req', async () => {
      const data = cachedResponses.before
      assert.strictEqual(data.charge.id, cachedCharge.id)
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
    it('should refund charge (screenshots)', async () => {
      const result = cachedResponses.submit
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'success')
    })
  })
})
