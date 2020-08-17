/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')
const TestStripeAccounts = require('../../../../../test-stripe-accounts.js')
const DashboardTestHelper = require('@userdashboard/dashboard/test-helper.js')

describe('/api/user/subscriptions/refunds', function () {
  this.timeout(60 * 60 * 1000)
  const cachedResponses = {}
  const cachedRefunds = []
  after(TestHelper.deleteOldWebhooks)

  before(async () => {
    await DashboardTestHelper.setupBeforeEach()
    await TestHelper.setupBeforeEach()
    await TestHelper.setupWebhook()
    const administrator = await TestHelper.createOwner()
    await TestHelper.createProduct(administrator, {
      published: 'true'
    })
    const user = await TestStripeAccounts.createUserWithPaymentMethod()
    for (let i = 0, len = global.pageSize + 2; i < len; i++) {
      await TestHelper.createPlan(administrator, {
        productid: administrator.product.id,
        usage_type: 'licensed',
        published: 'true',
        trial_period_days: '0',
        amount: '10000',
        interval: 'day'
      })
      await TestHelper.createSubscription(user, administrator.plan.id)
      await TestHelper.createRefund(administrator, user.charge.id)
      cachedRefunds.unshift(administrator.refund.id)
      await TestHelper.deleteOldWebhooks()
      await TestHelper.setupWebhook()
    }
    const req1 = TestHelper.createRequest(`/api/user/subscriptions/refunds?accountid=${user.account.accountid}&offset=1`)
    req1.account = user.account
    req1.session = user.session
    cachedResponses.offset = await req1.get()
    const req2 = TestHelper.createRequest(`/api/user/subscriptions/refunds?accountid=${user.account.accountid}&limit=1`)
    req2.account = user.account
    req2.session = user.session
    cachedResponses.limit = await req2.get()
    const req3 = TestHelper.createRequest(`/api/user/subscriptions/refunds?accountid=${user.account.accountid}&all=true`)
    req3.account = user.account
    req3.session = user.session
    cachedResponses.all = await req3.get()
    const req4 = TestHelper.createRequest(`/api/user/subscriptions/refunds?accountid=${user.account.accountid}`)
    req4.account = user.account
    req4.session = user.session
    req4.filename = __filename
    req4.saveResponse = true
    cachedResponses.returns = await req4.get()
    global.pageSize = 3
    cachedResponses.pageSize = await req4.get()
  })
  describe('exceptions', () => {
    describe('invalid-accountid', () => {
      it('missing querystring accountid', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/subscriptions/refunds')
        req.account = user.account
        req.session = user.session
        let errorMessage
        try {
          await req.get()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-accountid')
      })

      it('invalid querystring accountid', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/subscriptions/refunds?accountid=invalid')
        req.account = user.account
        req.session = user.session
        let errorMessage
        try {
          await req.get()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-accountid')
      })
    })

    describe('invalid-account', () => {
      it('ineligible accessing account', async () => {
        const user = await TestHelper.createUser()
        const user2 = await TestHelper.createUser()
        const req = TestHelper.createRequest(`/api/user/subscriptions/refunds?accountid=${user.account.accountid}`)
        req.account = user2.account
        req.session = user2.session
        let errorMessage
        try {
          await req.get()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-account')
      })
    })
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
