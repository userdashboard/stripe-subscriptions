/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')
const DashboardTestHelper = require('@userdashboard/dashboard/test-helper.js')

describe('/api/user/subscriptions/published-plans', function () {
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
    const user = await TestHelper.createUser()
    for (let i = 0, len = global.pageSize + 2; i < len; i++) {
      await TestHelper.createPlan(administrator, {
        productid: administrator.product.id,
        usage_type: 'licensed',
        published: 'true'
      })
      cachedPlans.unshift(administrator.plan.id)
    }
    const req1 = TestHelper.createRequest('/api/user/subscriptions/published-plans?offset=1')
    req1.account = user.account
    req1.session = user.session
    cachedResponses.offset = await req1.get()
    const req2 = TestHelper.createRequest('/api/user/subscriptions/published-plans?limit=1')
    req2.account = user.account
    req2.session = user.session
    cachedResponses.limit = await req2.get()
    const req3 = TestHelper.createRequest('/api/user/subscriptions/published-plans?all=true')
    req3.account = user.account
    req3.session = user.session
    cachedResponses.all = await req3.get()
    const req4 = TestHelper.createRequest('/api/user/subscriptions/published-plans')
    req4.account = user.account
    req4.session = user.session
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
      const plans = cachedResponses.returns
      assert.strictEqual(plans.length, global.pageSize)
    })
  })

  describe('configuration', () => {
    it('environment PAGE_SIZE', async () => {
      global.pageSize = 3
      const plans = cachedResponses.pageSize
      assert.strictEqual(plans.length, global.pageSize)
    })
  })
})
