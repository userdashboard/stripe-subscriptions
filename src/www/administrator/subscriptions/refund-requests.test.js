/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')
const TestStripeAccounts = require('../../../../test-stripe-accounts.js')
const DashboardTestHelper = require('@userdashboard/dashboard/test-helper.js')

describe('/administrator/subscriptions/refund-requests', function () {
  const cachedResponses = {}
  const cachedCharges = []
  after(TestHelper.deleteOldWebhooks)
  before(async () => {
    await DashboardTestHelper.setupBeforeEach()
    await TestHelper.setupBeforeEach()
    await TestHelper.setupWebhook()
    const administrator = await TestHelper.createOwner()
    await TestHelper.createProduct(administrator, {
      published: 'true'
    })
    global.delayDiskWrites = true
    for (let i = 0, len = global.pageSize + 2; i < len; i++) {
      await TestHelper.createPlan(administrator, {
        productid: administrator.product.id,
        usage_type: 'licensed',
        published: 'true',
        amount: '100000',
        trial_period_days: '0'
      })
      const user = await TestStripeAccounts.createUserWithPaymentMethod()
      await TestHelper.createSubscription(user, administrator.plan.id)
      await TestHelper.requestRefund(user, user.charge.id)
      cachedCharges.unshift(user.charge.id)
      await TestHelper.deleteOldWebhooks()
      await TestHelper.setupWebhook()
    }
    const req1 = TestHelper.createRequest('/administrator/subscriptions/refund-requests')
    req1.account = administrator.account
    req1.session = administrator.session
    req1.filename = __filename
    req1.screenshots = [
      { hover: '#administrator-menu-container' },
      { click: '/administrator/subscriptions' },
      { click: '/administrator/subscriptions/refund-requests' }
    ]
    await req1.route.api.before(req1)
    cachedResponses.before = req1.data
    cachedResponses.returns = await req1.get()
    global.pageSize = 3
    cachedResponses.pageSize = await req1.get()
    const req2 = TestHelper.createRequest('/administrator/subscriptions/refund-requests?offset=1')
    req2.account = administrator.account
    req2.session = administrator.session
    cachedResponses.offset = await req2.get()
  })
  describe('before', () => {
    it('should bind data to req', async () => {
      const data = cachedResponses.before
      assert.strictEqual(data.charges.length, global.pageSize)
      assert.strictEqual(data.charges[0].id, cachedCharges[0])
      assert.strictEqual(data.charges[1].id, cachedCharges[1])
    })
  })

  describe('view', () => {
    it('should return one page (screenshots)', async () => {
      const result = cachedResponses.returns
      const doc = TestHelper.extractDoc(result.html)
      const table = doc.getElementById('charges-table')
      const rows = table.getElementsByTagName('tr')
      assert.strictEqual(rows.length, global.pageSize + 1)
    })

    it('should change page size', async () => {
      global.pageSize = 3
      const result = cachedResponses.pageSize
      const doc = TestHelper.extractDoc(result.html)
      const table = doc.getElementById('charges-table')
      const rows = table.getElementsByTagName('tr')
      assert.strictEqual(rows.length, global.pageSize + 1)
    })

    it('should change offset', async () => {
      const offset = 1
      const result = cachedResponses.offset
      const doc = TestHelper.extractDoc(result.html)
      for (let i = 0, len = global.pageSize; i < len; i++) {
        assert.strictEqual(doc.getElementById(cachedCharges[offset + i]).tag, 'tr')
      }
    })
  })
})
