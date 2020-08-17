/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')
const TestStripeAccounts = require('../../../../../test-stripe-accounts.js')
const DashboardTestHelper = require('@userdashboard/dashboard/test-helper.js')

describe('/api/administrator/subscriptions/setup-intents', function () {
  this.timeout(60 * 60 * 1000)
  const cachedResponses = {}
  const cachedSetupIntents = []
  after(TestHelper.deleteOldWebhooks)
  before(async () => {
    await DashboardTestHelper.setupBeforeEach()
    await TestHelper.setupBeforeEach()
    await TestHelper.setupWebhook()
    const administrator = await TestStripeAccounts.createOwnerWithPlan()
    for (let i = 0, len = global.pageSize + 2; i < len; i++) {
      const user = await TestStripeAccounts.createUserWithPaymentMethod()
      cachedSetupIntents.unshift(user.setupIntent.id)
    }
    const req1 = TestHelper.createRequest('/api/administrator/subscriptions/setup-intents?offset=1')
    req1.account = administrator.account
    req1.session = administrator.session
    cachedResponses.offset = await req1.get()
    const req2 = TestHelper.createRequest('/api/administrator/subscriptions/setup-intents?limit=1')
    req2.account = administrator.account
    req2.session = administrator.session
    cachedResponses.limit = await req2.get()
    const req3 = TestHelper.createRequest('/api/administrator/subscriptions/setup-intents?all=true')
    req3.account = administrator.account
    req3.session = administrator.session
    cachedResponses.all = await req3.get()
    const req4 = TestHelper.createRequest('/api/administrator/subscriptions/setup-intents')
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
      const setupIntentsNow = cachedResponses.offset
      for (let i = 0, len = global.pageSize; i < len; i++) {
        assert.strictEqual(setupIntentsNow[i].id, cachedSetupIntents[offset + i])
      }
    })

    it('optional querystring limit (integer)', async () => {
      const limit = 1
      const setupIntentsNow = cachedResponses.limit
      assert.strictEqual(setupIntentsNow.length, limit)
    })

    it('optional querystring all (boolean)', async () => {
      const setupIntentsNow = cachedResponses.all
      assert.strictEqual(setupIntentsNow.length, cachedSetupIntents.length)
    })
  })

  describe('returns', () => {
    it('array', async () => {
      const setupIntentsNow = cachedResponses.returns
      assert.strictEqual(setupIntentsNow.length, global.pageSize)
    })
  })

  describe('configuration', () => {
    it('environment PAGE_SIZE', async () => {
      global.pageSize = 3
      const setupIntentsNow = cachedResponses.pageSize
      assert.strictEqual(setupIntentsNow.length, global.pageSize)
    })
  })
})
