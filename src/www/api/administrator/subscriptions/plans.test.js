/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')
const DashboardTestHelper = require('@userdashboard/dashboard/test-helper.js')

describe('/api/administrator/subscriptions/plans', function () {
  this.timeout(60 * 60 * 1000)
  const cachedResponses = {}
  const cachedPlans = []
  before(async () => {
    await DashboardTestHelper.setupBeforeEach()
    await TestHelper.setupBeforeEach()
    const administrator = await TestHelper.createOwner()
    await TestHelper.createProduct(administrator, {
      published: 'true'
    })
    for (let i = 0, len = global.pageSize + 2; i < len; i++) {
      await TestHelper.createPlan(administrator, {
        productid: administrator.product.id,
        usage_type: 'licensed',
        published: 'true',
        trial_period_days: '0',
        amount: '1000'
      })
      cachedPlans.unshift(administrator.plan.id)
    }
    const req1 = TestHelper.createRequest('/api/administrator/subscriptions/plans?offset=1')
    req1.account = administrator.account
    req1.session = administrator.session
    cachedResponses.offset = await req1.get()
    const req2 = TestHelper.createRequest('/api/administrator/subscriptions/plans?limit=1')
    req2.account = administrator.account
    req2.session = administrator.session
    cachedResponses.limit = await req2.get()
    const req3 = TestHelper.createRequest('/api/administrator/subscriptions/plans?all=true')
    req3.account = administrator.account
    req3.session = administrator.session
    cachedResponses.all = await req3.get()
    const req4 = TestHelper.createRequest('/api/administrator/subscriptions/plans')
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
      const plansNow = cachedResponses.offset
      for (let i = 0, len = global.pageSize; i < len; i++) {
        assert.strictEqual(plansNow[i].id, cachedPlans[offset + i])
      }
    })

    it('optional querystring limit (integer)', async () => {
      const limit = 1
      const plansNow = cachedResponses.limit
      assert.strictEqual(plansNow.length, limit)
    })

    it('optional querystring all (boolean)', async () => {
      const plansNow = cachedResponses.all
      assert.strictEqual(plansNow.length, cachedPlans.length)
    })
  })

  describe('returns', () => {
    it('array', async () => {
      const plansNow = cachedResponses.returns
      assert.strictEqual(plansNow.length, global.pageSize)
    })
  })

  describe('configuration', () => {
    it('environment PAGE_SIZE', async () => {
      global.pageSize = 3
      const plansNow = cachedResponses.pageSize
      assert.strictEqual(plansNow.length, global.pageSize)
    })
  })
})
