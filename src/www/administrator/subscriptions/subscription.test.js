/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')
const TestStripeAccounts = require('../../../../test-stripe-accounts.js')

describe('/administrator/subscriptions/subscription', function () {
  this.timeout(60 * 60 * 1000)
  after(TestHelper.deleteOldWebhooks)
  before(TestHelper.setupWebhook)
  describe('before', () => {
    it('should reject invalid subscriptionid', async () => {
      const administrator = await TestHelper.createOwner()
      const req = TestHelper.createRequest('/administrator/subscriptions/subscription?subscriptionid=invalid')
      req.account = administrator.account
      req.session = administrator.session
      let errorMessage
      try {
        await req.route.api.before(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-subscriptionid')
    })

    it('should bind data to req', async () => {
      const administrator = await TestStripeAccounts.createOwnerWithPlan()
      const user = await TestStripeAccounts.createUserWithPaymentMethod()
      await TestHelper.createSubscription(user, administrator.plan.id)
      const req = TestHelper.createRequest(`/administrator/subscriptions/subscription?subscriptionid=${user.subscription.id}`)
      req.account = administrator.account
      req.session = administrator.session
      await req.route.api.before(req)
      assert.strictEqual(req.data.subscription.id, user.subscription.id)
    })
  })

  describe('view', () => {
    it('should present the subscription table (screenshots)', async () => {
      const administrator = await TestStripeAccounts.createOwnerWithPlan()
      const user = await TestStripeAccounts.createUserWithPaymentMethod()
      await TestHelper.createSubscription(user, administrator.plan.id)
      const req = TestHelper.createRequest(`/administrator/subscriptions/subscription?subscriptionid=${user.subscription.id}`)
      req.account = administrator.account
      req.session = administrator.session
      req.filename = __filename
      req.screenshots = [
        { hover: '#administrator-menu-container' },
        { click: '/administrator/subscriptions' },
        { click: '/administrator/subscriptions/subscriptions' },
        { click: `/administrator/subscriptions/subscription?subscriptionid=${user.subscription.id}` }
      ]
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      const tbody = doc.getElementById(user.subscription.id)
      assert.strictEqual(tbody.tag, 'tbody')
    })
  })
})
