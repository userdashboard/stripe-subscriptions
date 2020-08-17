/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')
const TestStripeAccounts = require('../../../../test-stripe-accounts.js')
const DashboardTestHelper = require('@userdashboard/dashboard/test-helper.js')

describe('/administrator/subscriptions/payment-intents', function () {
  this.timeout(60 * 60 * 1000)
  const cachedResponses = {}
  const cachedPaymentIntents = []
  before(async () => {
    await DashboardTestHelper.setupBeforeEach()
    await TestHelper.setupBeforeEach()
    const administrator = await TestHelper.createOwner()
    global.delayDiskWrites = true
    for (let i = 0, len = global.pageSize + 2; i < len; i++) {
      const user = await TestStripeAccounts.createUserWithPaymentMethod()
      await TestHelper.createPaymentIntent(user, {
        paymentmethodid: user.paymentMethod.id,
        amount: 10000,
        currency: 'usd'
      })
      cachedPaymentIntents.unshift(user.paymentIntent.id)
    }
    const req1 = TestHelper.createRequest('/administrator/subscriptions/payment-intents')
    req1.account = administrator.account
    req1.session = administrator.session
    req1.filename = __filename
    req1.screenshots = [
      { hover: '#administrator-menu-container' },
      { click: '/administrator/subscriptions' },
      { click: '/administrator/subscriptions/payment-intents' }
    ]
    await req1.route.api.before(req1)
    cachedResponses.before = req1.data
    cachedResponses.returns = await req1.get()
    global.pageSize = 3
    cachedResponses.pageSize = await req1.get()
    const req2 = TestHelper.createRequest('/administrator/subscriptions/payment-intents?offset=1')
    req2.account = administrator.account
    req2.session = administrator.session
    cachedResponses.offset = await req2.get()
  })
  describe('before', () => {
    it('should bind data to req', async () => {
      const data = cachedResponses.before
      assert.strictEqual(data.paymentIntents.length, global.pageSize)
      assert.strictEqual(data.paymentIntents[0].id, cachedPaymentIntents[0])
      assert.strictEqual(data.paymentIntents[1].id, cachedPaymentIntents[1])
    })
  })

  describe('view', () => {
    it('should return one page (screenshots)', async () => {
      const result = cachedResponses.returns
      const doc = TestHelper.extractDoc(result.html)
      const table = doc.getElementById('payment-intents-table')
      const rows = table.getElementsByTagName('tr')
      assert.strictEqual(rows.length, global.pageSize + 1)
    })

    it('should change page size', async () => {
      global.pageSize = 3
      const result = cachedResponses.pageSize
      const doc = TestHelper.extractDoc(result.html)
      const table = doc.getElementById('payment-intents-table')
      const rows = table.getElementsByTagName('tr')
      assert.strictEqual(rows.length, global.pageSize + 1)
    })

    it('should change offset', async () => {
      const offset = 1
      const result = cachedResponses.offset
      const doc = TestHelper.extractDoc(result.html)
      for (let i = 0, len = global.pageSize; i < len; i++) {
        assert.strictEqual(doc.getElementById(cachedPaymentIntents[offset + i]).tag, 'tr')
      }
    })
  })
})
