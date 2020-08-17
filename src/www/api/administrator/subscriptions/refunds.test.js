/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')
const TestStripeAccounts = require('../../../../../test-stripe-accounts.js')
const DashboardTestHelper = require('@userdashboard/dashboard/test-helper.js')

describe('/api/administrator/subscriptions/refunds', function () {
  this.timeout(60 * 60 * 1000)
  const cachedResponses = {}
  const cachedRefunds = []
  after(TestHelper.deleteOldWebhooks)
  before(async () => {
    await DashboardTestHelper.setupBeforeEach()
    await TestHelper.setupBeforeEach()
    await TestHelper.setupWebhook()
    const administrator = await TestStripeAccounts.createOwnerWithPlan()
    for (let i = 0, len = global.pageSize + 2; i < len; i++) {
      const user = await TestStripeAccounts.createUserWithPaymentMethod()
      await TestHelper.createSubscription(user, administrator.plan.id)
      await TestHelper.createRefund(administrator, user.charge.id)
      cachedRefunds.unshift(administrator.refund.id)
      await TestHelper.deleteOldWebhooks()
      await TestHelper.setupWebhook()
    }
    const req1 = TestHelper.createRequest('/api/administrator/subscriptions/refunds?offset=1')
    req1.account = administrator.account
    req1.session = administrator.session
    cachedResponses.offset = await req1.get()
    const req2 = TestHelper.createRequest('/api/administrator/subscriptions/refunds?limit=1')
    req2.account = administrator.account
    req2.session = administrator.session
    cachedResponses.limit = await req2.get()
    const req3 = TestHelper.createRequest('/api/administrator/subscriptions/refunds?all=true')
    req3.account = administrator.account
    req3.session = administrator.session
    cachedResponses.all = await req3.get()
    const req4 = TestHelper.createRequest('/api/administrator/subscriptions/refunds')
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
      const refundsNow = cachedResponses.offset
      for (let i = 0, len = global.pageSize; i < len; i++) {
        assert.strictEqual(refundsNow[i].id, cachedRefunds[offset + i])
      }
    })

    it('optional querystring limit (integer)', async () => {
      const limit = 1
      const refundsNow = cachedResponses.limit
      assert.strictEqual(refundsNow.length, limit)
    })

    it('optional querystring all (boolean)', async () => {
      const refundsNow = cachedResponses.all
      assert.strictEqual(refundsNow.length, cachedRefunds.length)
    })
  })

  describe('returns', () => {
    it('array', async () => {
      const refundsNow = cachedResponses.returns
      assert.strictEqual(refundsNow.length, global.pageSize)
    })
  })

  describe('configuration', () => {
    it('environment PAGE_SIZE', async () => {
      global.pageSize = 3
      const refundsNow = cachedResponses.pageSize
      assert.strictEqual(refundsNow.length, global.pageSize)
    })
  })
})
