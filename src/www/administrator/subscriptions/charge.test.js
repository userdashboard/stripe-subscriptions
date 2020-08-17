/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')
const TestStripeAccounts = require('../../../../test-stripe-accounts.js')

describe('/administrator/subscriptions/charge', function () {
  this.timeout(60 * 60 * 1000)
  afterEach(TestHelper.deleteOldWebhooks)
  beforeEach(TestHelper.setupWebhook)
  describe('before', () => {
    it('should reject invalid charge', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user, {
        email: user.profile.contactEmail,
        description: user.profile.firstName,
        country: 'US'
      })
      const req = TestHelper.createRequest('/administrator/subscriptions/charge?chargeid=invalid')
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

    it('should bind data to req', async () => {
      const administrator = await TestStripeAccounts.createOwnerWithPlan()
      const user = await TestStripeAccounts.createUserWithPaymentMethod()
      await TestHelper.createSubscription(user, administrator.plan.id)
      const req = TestHelper.createRequest(`/administrator/subscriptions/charge?chargeid=${user.charge.id}`)
      req.account = administrator.account
      req.session = administrator.session
      await req.route.api.before(req)
      assert.strictEqual(req.data.charge.id, user.charge.id)
    })
  })

  describe('view', () => {
    it('should present the charge table (screenshots)', async () => {
      const administrator = await TestStripeAccounts.createOwnerWithPlan()
      const user = await TestStripeAccounts.createUserWithPaymentMethod()
      await TestHelper.createSubscription(user, administrator.plan.id)
      const req = TestHelper.createRequest(`/administrator/subscriptions/charge?chargeid=${user.charge.id}`)
      req.account = administrator.account
      req.session = administrator.session
      req.filename = __filename
      req.screenshots = [
        { hover: '#administrator-menu-container' },
        { click: '/administrator/subscriptions' },
        { click: '/administrator/subscriptions/charges' },
        { click: `/administrator/subscriptions/charge?chargeid=${user.charge.id}` }
      ]
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      const tbody = doc.getElementById(user.charge.id)
      assert.strictEqual(tbody.tag, 'tbody')
    })
  })
})
