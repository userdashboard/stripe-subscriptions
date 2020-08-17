/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')
const TestStripeAccounts = require('../../../../../test-stripe-accounts.js')

describe('/api/user/subscriptions/charges-count', function () {
  before(TestHelper.setupWebhook)
  after(TestHelper.deleteOldWebhooks)
  describe('returns', () => {
    it('integer', async () => {
      const administrator = await TestHelper.createOwner()
      await TestHelper.createProduct(administrator, {
        published: 'true'
      })
      const user = await TestStripeAccounts.createUserWithPaymentMethod()
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        await TestHelper.createPlan(administrator, {
          productid: administrator.product.id,
          usage_type: 'licensed',
          published: 'true',
          trial_period_days: '0',
          amount: '1000'
        })
        await TestHelper.createSubscription(user, administrator.plan.id)
      }
      const req = TestHelper.createRequest(`/api/user/subscriptions/charges-count?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      req.filename = __filename
      req.saveResponse = true
      const result = await req.get()
      assert.strictEqual(result, global.pageSize + 1)
    })
  })
})
