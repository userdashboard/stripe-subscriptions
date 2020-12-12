/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')
const DashboardTestHelper = require('@userdashboard/dashboard/test-helper.js')

describe('/administrator/subscriptions/payouts', function () {
  if (!process.env.DISABLE_PAYOUT_TESTS) {
    const cachedResponses = {}
    const cachedPayouts = []
    after(TestHelper.deleteOldWebhooks)
    before(async () => {
      await DashboardTestHelper.setupBeforeEach()
      await TestHelper.setupBeforeEach()
      await TestHelper.setupWebhook()
      const administrator = await TestHelper.createOwner()
      global.delayDiskWrites = true
      for (let i = 0, len = global.pageSize + 2; i < len; i++) {
        await TestHelper.createPayout(administrator)
        cachedPayouts.unshift(administrator.payout.id)
      }
      const req1 = TestHelper.createRequest('/administrator/subscriptions/payouts')
      req1.account = administrator.account
      req1.session = administrator.session
      req1.filename = __filename
      req1.screenshots = [
        { hover: '#administrator-menu-container' },
        { click: '/administrator/subscriptions' },
        { click: '/administrator/subscriptions/payouts' }
      ]
      await req1.route.api.before(req1)
      cachedResponses.before = req1.data
      cachedResponses.returns = await req1.get()
      global.pageSize = 3
      cachedResponses.pageSize = await req1.get()
      const req2 = TestHelper.createRequest('/administrator/subscriptions/payouts?offset=1')
      req2.account = administrator.account
      req2.session = administrator.session
      cachedResponses.offset = await req2.get()
    })
    describe('before', () => {
      it('should bind data to req', async () => {
        const data = cachedResponses.before
        assert.strictEqual(data.payouts.length, global.pageSize)
        assert.strictEqual(data.payouts[0].id, cachedPayouts[0])
        assert.strictEqual(data.payouts[1].id, cachedPayouts[1])
      })
    })

    describe('view', () => {
      it('should return one page (screenshots)', async () => {
        const result = cachedResponses.returns
        const doc = TestHelper.extractDoc(result.html)
        const table = doc.getElementById('payouts-table')
        const rows = table.getElementsByTagName('tr')
        assert.strictEqual(rows.length, global.pageSize + 1)
      })

      it('should change page size', async () => {
        global.pageSize = 3
        const result = cachedResponses.pageSize
        const doc = TestHelper.extractDoc(result.html)
        const table = doc.getElementById('payouts-table')
        const rows = table.getElementsByTagName('tr')
        assert.strictEqual(rows.length, global.pageSize + 1)
      })

      it('should change offset', async () => {
        const offset = 1
        const result = cachedResponses.offset
        const doc = TestHelper.extractDoc(result.html)
        for (let i = 0, len = global.pageSize; i < len; i++) {
          assert.strictEqual(doc.getElementById(cachedPayouts[offset + i]).tag, 'tr')
        }
      })
    })
  }
})
