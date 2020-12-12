/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')
const TestStripeAccounts = require('../../../../../test-stripe-accounts.js')
const DashboardTestHelper = require('@userdashboard/dashboard/test-helper.js')

describe('/api/administrator/subscriptions/payment-intents', function () {
  const cachedResponses = {}
  const cachedPaymentIntents = []
  before(async () => {
    await DashboardTestHelper.setupBeforeEach()
    await TestHelper.setupBeforeEach()
    const administrator = await TestHelper.createOwner()
    for (let i = 0, len = global.pageSize + 2; i < len; i++) {
      const user = await TestStripeAccounts.createUserWithPaymentMethod()
      await TestHelper.createPaymentIntent(user, {
        paymentmethodid: user.paymentMethod.id,
        amount: 10000,
        currency: 'usd'
      })
      cachedPaymentIntents.unshift(user.paymentIntent.id)
    }
    const offset = 1
    const limit = 1
    const req1 = TestHelper.createRequest(`/api/administrator/subscriptions/payment-intents?offset=${offset}`)
    req1.account = administrator.account
    req1.session = administrator.session
    cachedResponses.offset = await req1.get()
    const req2 = TestHelper.createRequest(`/api/administrator/subscriptions/payment-intents?limit=${limit}`)
    req2.account = administrator.account
    req2.session = administrator.session
    cachedResponses.limit = await req2.get()
    const req3 = TestHelper.createRequest('/api/administrator/subscriptions/payment-intents?all=true')
    req3.account = administrator.account
    req3.session = administrator.session
    cachedResponses.all = await req3.get()
    const req4 = TestHelper.createRequest('/api/administrator/subscriptions/payment-intents')
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
      const paymentIntentsNow = cachedResponses.offset
      for (let i = 0, len = global.pageSize; i < len; i++) {
        assert.strictEqual(paymentIntentsNow[i].id, cachedPaymentIntents[offset + i])
      }
    })

    it('optional querystring all (boolean)', async () => {
      const paymentIntentsNow = cachedResponses.all
      assert.strictEqual(paymentIntentsNow.length, cachedPaymentIntents.length)
    })
  })

  describe('returns', () => {
    it('array', async () => {
      const paymentIntentsNow = cachedResponses.returns
      assert.strictEqual(paymentIntentsNow.length, global.pageSize)
    })
  })

  describe('configuration', () => {
    it('environment PAGE_SIZE', async () => {
      global.pageSize = 3
      const paymentIntentsNow = cachedResponses.pageSize
      assert.strictEqual(paymentIntentsNow.length, global.pageSize)
    })
  })
})
