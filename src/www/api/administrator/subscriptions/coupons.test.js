/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')
const DashboardTestHelper = require('@userdashboard/dashboard/test-helper.js')

describe('/api/administrator/subscriptions/coupons', function () {
  this.timeout(60 * 60 * 1000)
  const cachedResponses = {}
  const cachedCoupons = []
  before(async () => {
    await DashboardTestHelper.setupBeforeEach()
    await TestHelper.setupBeforeEach()
    const administrator = await TestHelper.createOwner()
    for (let i = 0, len = global.pageSize + 2; i < len; i++) {
      await TestHelper.createCoupon(administrator, {
        published: 'true',
        percent_off: '25',
        duration: 'repeating',
        duration_in_months: '1'
      })
      cachedCoupons.unshift(administrator.coupon.id)
    }
    const req1 = TestHelper.createRequest('/api/administrator/subscriptions/coupons?offset=1')
    req1.account = administrator.account
    req1.session = administrator.session
    cachedResponses.offset = await req1.get()
    const req2 = TestHelper.createRequest('/api/administrator/subscriptions/coupons?limit=1')
    req2.account = administrator.account
    req2.session = administrator.session
    cachedResponses.limit = await req2.get()
    const req3 = TestHelper.createRequest('/api/administrator/subscriptions/coupons?all=true')
    req3.account = administrator.account
    req3.session = administrator.session
    cachedResponses.all = await req3.get()
    const req4 = TestHelper.createRequest('/api/administrator/subscriptions/coupons')
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
      const couponsNow = cachedResponses.offset
      for (let i = 0, len = global.pageSize; i < len; i++) {
        assert.strictEqual(couponsNow[i].id, cachedCoupons[offset + i])
      }
    })

    it('optional querystring limit (integer)', async () => {
      const limit = 1
      const couponsNow = cachedResponses.limit
      assert.strictEqual(couponsNow.length, limit)
    })

    it('optional querystring all (boolean)', async () => {
      const couponsNow = cachedResponses.all
      assert.strictEqual(couponsNow.length, cachedCoupons.length)
    })
  })

  describe('returns', () => {
    it('array', async () => {
      const coupons = cachedResponses.returns
      assert.strictEqual(coupons.length, global.pageSize)
    })
  })

  describe('configuration', () => {
    it('environment PAGE_SIZE', async () => {
      global.pageSize = 3
      const coupons = cachedResponses.pageSize
      assert.strictEqual(coupons.length, global.pageSize)
    })
  })
})
