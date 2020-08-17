/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')
const TestStripeAccounts = require('../../../../../test-stripe-accounts.js')

describe('/api/administrator/subscriptions/invoices-count', function () {
  this.timeout(60 * 60 * 1000)
  before(TestHelper.setupWebhook)
  after(TestHelper.deleteOldWebhooks)
  describe('returns', () => {
    it('integer', async () => {
      const administrator = await TestStripeAccounts.createOwnerWithPlan()
      for (let i = 0, len = global.pageSize + 2; i < len; i++) {
        const user = await TestStripeAccounts.createUserWithPaymentMethod()
        await TestHelper.createSubscription(user, administrator.plan.id)
        await TestHelper.deleteOldWebhooks()
        await TestHelper.setupWebhook()
      }
      const req = TestHelper.createRequest('/api/administrator/subscriptions/invoices-count')
      req.account = administrator.account
      req.session = administrator.session
      req.filename = __filename
      req.saveResponse = true
      const result = await req.get()
      assert.strictEqual(result, global.pageSize + 2)
    })
  })
})
