/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')
const DashboardTestHelper = require('@userdashboard/dashboard/test-helper.js')

describe('/account/subscriptions/plans', function () {
  this.timeout(60 * 60 * 1000)
  const cachedResponses = {}
  const cachedPlans = []
  before(async () => {
    await DashboardTestHelper.setupBeforeEach()
    await TestHelper.setupBeforeEach()
    global.delayDiskWrites = true
    const administrator = await TestHelper.createOwner()
    await TestHelper.createProduct(administrator, {
      published: 'true'
    })
    const user = await TestHelper.createUser()
    for (let i = 0, len = global.pageSize + 2; i < len; i++) {
      await TestHelper.createPlan(administrator, {
        productid: administrator.product.id,
        usage_type: 'licensed',
        published: 'true',
        amount: '100000',
        trial_period_days: '0'
      })
      cachedPlans.unshift(administrator.plan.id)
    }
    const req1 = TestHelper.createRequest('/account/subscriptions/plans')
    req1.account = user.account
    req1.session = user.session
    req1.filename = __filename
    req1.screenshots = [
      { hover: '#account-menu-container' },
      { click: '/account/subscriptions' },
      { click: '/account/subscriptions/plans' }
    ]
    await req1.route.api.before(req1)
    cachedResponses.before = req1.data
    cachedResponses.returns = await req1.get()
    global.pageSize = 3
    cachedResponses.pageSize = await req1.get()
    const req2 = TestHelper.createRequest('/account/subscriptions/plans?offset=1')
    req2.account = user.account
    req2.session = user.session
    cachedResponses.offset = await req2.get()
  })
  describe('before', () => {
    it('should bind data to req', async () => {
      const data = cachedResponses.before
      assert.strictEqual(data.plans[0].id, cachedPlans[0])
      assert.strictEqual(data.plans[1].id, cachedPlans[1])
    })
  })

  describe('view', () => {
    it('should return one page (screenshots)', async () => {
      const result = cachedResponses.returns
      const doc = TestHelper.extractDoc(result.html)
      const table = doc.getElementById('plans-table')
      const rows = table.getElementsByTagName('tr')
      assert.strictEqual(rows.length, global.pageSize + 1)
    })

    it('should change page size', async () => {
      global.pageSize = 3
      const result = cachedResponses.pageSize
      const doc = TestHelper.extractDoc(result.html)
      const table = doc.getElementById('plans-table')
      const rows = table.getElementsByTagName('tr')
      assert.strictEqual(rows.length, global.pageSize + 1)
    })

    it('should change offset', async () => {
      const offset = 1
      const result = cachedResponses.offset
      const doc = TestHelper.extractDoc(result.html)
      for (let i = 0, len = global.pageSize; i < len; i++) {
        assert.strictEqual(doc.getElementById(cachedPlans[offset + i]).tag, 'tr')
      }
    })
  })
})
