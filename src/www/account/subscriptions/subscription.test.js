/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')
const TestStripeAccounts = require('../../../../test-stripe-accounts.js')
const DashboardTestHelper = require('@userdashboard/dashboard/test-helper.js')

describe('/account/subscriptions/subscription', function () {
  this.timeout(60 * 60 * 1000)
  after(TestHelper.deleteOldWebhooks)
  const cachedResponses = {}
  let cachedSubscription
  before(async () => {
    await DashboardTestHelper.setupBeforeEach()
    await TestHelper.setupBeforeEach()
    await TestHelper.setupWebhook()
    global.delayDiskWrites = true
    const administrator = await TestStripeAccounts.createOwnerWithPlan()
    const user = await TestStripeAccounts.createUserWithPaymentMethod()
    cachedSubscription = await TestHelper.createSubscription(user, administrator.plan.id)
    const req = TestHelper.createRequest(`/account/subscriptions/subscription?subscriptionid=${user.subscription.id}`)
    req.account = user.account
    req.session = user.session
    req.filename = __filename
    req.screenshots = [
      { hover: '#account-menu-container' },
      { click: '/account/subscriptions' },
      { click: '/account/subscriptions/subscriptions' },
      { click: `/account/subscriptions/subscription?subscriptionid=${user.subscription.id}` }
    ]
    await req.route.api.before(req)
    cachedResponses.before = req.data
    cachedResponses.returns = await req.get()
    const user2 = await TestHelper.createUser()
    req.account = user2.account
    req.session = user2.session
    try {
      await req.route.api.before(req)
    } catch (error) {
      cachedResponses.invalidAccount = error.message
    }
  })
  describe('exceptions', () => {
    it('invalid-subscriptionid', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user, {
        email: user.profile.contactEmail,
        description: user.profile.firstName,
        country: 'US'
      })
      const req = TestHelper.createRequest('/account/subscriptions/subscription?subscriptionid=invalid')
      req.account = user.account
      req.session = user.session
      let errorMessage
      try {
        await req.route.api.before(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-subscriptionid')
    })

    it('invalid-account', async () => {
      const errorMessage = cachedResponses.invalidAccount
      assert.strictEqual(errorMessage, 'invalid-account')
    })
  })

  describe('before', () => {
    it('should bind data to req', async () => {
      const data = cachedResponses.before
      assert.strictEqual(data.subscription.id, cachedSubscription.id)
    })
  })

  describe('view', () => {
    it('should present the subscription table (screenshots)', async () => {
      const result = cachedResponses.returns
      const doc = TestHelper.extractDoc(result.html)
      const tbody = doc.getElementById(cachedSubscription.id)
      assert.strictEqual(tbody.tag, 'tbody')
    })
  })
})
