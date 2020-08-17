/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')
const TestStripeAccounts = require('../../../../test-stripe-accounts.js')

describe('/administrator/subscriptions/setup-intent', function () {
  this.timeout(60 * 60 * 1000)
  after(TestHelper.deleteOldWebhooks)
  before(TestHelper.setupWebhook)
  describe('before', () => {
    it('should reject invalid setupintentid', async () => {
      const administrator = await TestHelper.createOwner()
      const req = TestHelper.createRequest('/administrator/subscriptions/setup-intent?setupintentid=invalid')
      req.account = administrator.account
      req.session = administrator.session
      let errorMessage
      try {
        await req.route.api.before(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-setupintentid')
    })

    it('should bind data to req', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestStripeAccounts.createUserWithPaymentMethod()
      const req = TestHelper.createRequest(`/administrator/subscriptions/setup-intent?setupintentid=${user.setupIntent.id}`)
      req.account = administrator.account
      req.session = administrator.session
      await req.route.api.before(req)
      assert.strictEqual(req.data.setupIntent.id, user.setupIntent.id)
    })
  })

  describe('view', () => {
    it('should have row for setup intent (screenshots)', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestStripeAccounts.createUserWithPaymentMethod()
      const req = TestHelper.createRequest(`/administrator/subscriptions/setup-intent?setupintentid=${user.setupIntent.id}`)
      req.account = administrator.account
      req.session = administrator.session
      req.filename = __filename
      req.screenshots = [
        { hover: '#administrator-menu-container' },
        { click: '/administrator/subscriptions' },
        { click: '/administrator/subscriptions/setup-intents' },
        { click: `/administrator/subscriptions/setup-intent?setupintentid=${user.setupIntent.id}` }
      ]
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      const tbody = doc.getElementById(user.setupIntent.id)
      assert.strictEqual(tbody.tag, 'tbody')
    })
  })
})
