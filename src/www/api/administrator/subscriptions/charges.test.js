/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')
const TestStripeAccounts = require('../../../../../test-stripe-accounts.js')
const DashboardTestHelper = require('@userdashboard/dashboard/test-helper.js')

describe('/api/administrator/subscriptions/charges', function () {
  this.timeout(60 * 60 * 1000)
  const cachedResponses = {}
  const cachedCharges = []
  after(TestHelper.deleteOldWebhooks)
  before(async () => {
    await DashboardTestHelper.setupBeforeEach()
    await TestHelper.setupBeforeEach()
    await TestHelper.setupWebhook()
    const administrator = await TestStripeAccounts.createOwnerWithPlan()
    await TestHelper.createProduct(administrator, {
      published: 'true'
    })
    await TestHelper.createPlan(administrator, {
      productid: administrator.product.id,
      usage_type: 'licensed',
      published: 'true',
      trial_period_days: '0',
      amount: '1000'
    })
    for (let i = 0, len = global.pageSize + 2; i < len; i++) {
      const user = await TestStripeAccounts.createUserWithPaymentMethod()
      await TestHelper.createSubscription(user, administrator.plan.id)
      cachedCharges.unshift(user.charge.id)
      await TestHelper.deleteOldWebhooks()
      await TestHelper.setupWebhook()
    }
    const req1 = TestHelper.createRequest('/api/administrator/subscriptions/charges?offset=1')
    req1.account = administrator.account
    req1.session = administrator.session
    cachedResponses.offset = await req1.get()
    const req2 = TestHelper.createRequest('/api/administrator/subscriptions/charges?limit=1')
    req2.account = administrator.account
    req2.session = administrator.session
    cachedResponses.limit = await req2.get()
    const req3 = TestHelper.createRequest('/api/administrator/subscriptions/charges?all=true')
    req3.account = administrator.account
    req3.session = administrator.session
    cachedResponses.all = await req3.get()
    const req4 = TestHelper.createRequest('/api/administrator/subscriptions/charges')
    req4.account = administrator.account
    req4.session = administrator.session
    req4.filename = __filename
    req4.saveResponse = true
    cachedResponses.returns = await req4.get()
    global.pageSize = 3
    cachedResponses.pageSize = await req4.get()
  })
  describe('receives', () => {
    it('optional querystring offset (integer)', async () => {
      const offset = 1
      const chargesNow = cachedResponses.offset
      for (let i = 0, len = global.pageSize; i < len; i++) {
        assert.strictEqual(chargesNow[i].id, cachedCharges[offset + i])
      }
    })

    it('optional querystring limit (integer)', async () => {
      const limit = 1
      const chargesNow = cachedResponses.limit
      assert.strictEqual(chargesNow.length, limit)
    })

    it('optional querystring all (boolean)', async () => {
      const chargesNow = cachedResponses.all
      assert.strictEqual(chargesNow.length, cachedCharges.length)
    })
  })

  describe('returns', () => {
    it('array', async () => {
      const chargesNow = cachedResponses.returns
      assert.strictEqual(chargesNow.length, global.pageSize)
    })
  })

  describe('configuration', () => {
    it('environment PAGE_SIZE', async () => {
      global.pageSize = 3
      const chargesNow = cachedResponses.pageSize
      assert.strictEqual(chargesNow.length, global.pageSize)
    })
  })
})
