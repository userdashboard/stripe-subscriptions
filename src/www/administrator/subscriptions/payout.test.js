/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/administrator/subscriptions/payout', function () {
  this.timeout(60 * 60 * 1000)
  after(TestHelper.deleteOldWebhooks)
  before(TestHelper.setupWebhook)
  describe('before', () => {
    it('should reject invalid payoutid', async () => {
      const administrator = await TestHelper.createOwner()
      const req = TestHelper.createRequest('/administrator/subscriptions/payout?payoutid=invalid')
      req.account = administrator.account
      req.session = administrator.session
      let errorMessage
      try {
        await req.route.api.before(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-payoutid')
    })
    if (!process.env.DISABLE_PAYOUT_TESTS) {
      it('should bind data to req', async () => {
        const administrator = await TestHelper.createOwner()
        const payout = await TestHelper.createPayout(administrator)
        const req = TestHelper.createRequest(`/administrator/subscriptions/payout?payoutid=${payout.id}`)
        req.account = administrator.account
        req.session = administrator.session
        await req.route.api.before(req)
        assert.strictEqual(req.data.payout.id, payout.id)
      })
    }
  })
  describe('view', () => {
    if (!process.env.DISABLE_PAYOUT_TESTS) {
      it('should have row for payout (screenshots)', async () => {
        const administrator = await TestHelper.createOwner()
        const payout = await TestHelper.createPayout(administrator)
        const req = TestHelper.createRequest(`/administrator/subscriptions/payout?payoutid=${payout.id}`)
        req.account = administrator.account
        req.session = administrator.session
        req.filename = __filename
        req.screenshots = [
          { hover: '#administrator-menu-container' },
          { click: '/administrator/subscriptions' },
          { click: '/administrator/subscriptions/payouts' },
          { click: `/administrator/subscriptions/payout?payoutid=${administrator.payout.id}` }
        ]
        const result = await req.get()
        const doc = TestHelper.extractDoc(result.html)
        const tbody = doc.getElementById(payout.id)
        assert.strictEqual(tbody.tag, 'tbody')
      })
    }
  })
})
