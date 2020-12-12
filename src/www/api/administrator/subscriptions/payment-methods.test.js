/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')
const TestStripeAccounts = require('../../../../../test-stripe-accounts.js')
const DashboardTestHelper = require('@userdashboard/dashboard/test-helper.js')

describe('/api/administrator/subscriptions/payment-methods', function () {
  const cachedResponses = {}
  const cachedPaymentMethods = []
  before(async () => {
    await DashboardTestHelper.setupBeforeEach()
    await TestHelper.setupBeforeEach()
    const administrator = await TestHelper.createOwner()
    for (let i = 0, len = global.pageSize + 2; i < len; i++) {
      const user = await TestStripeAccounts.createUserWithPaymentMethod()
      cachedPaymentMethods.unshift(user.paymentMethod.id)
    }
    const req1 = TestHelper.createRequest('/api/administrator/subscriptions/payment-methods?offset=1')
    req1.account = administrator.account
    req1.session = administrator.session
    cachedResponses.offset = await req1.get()
    const req2 = TestHelper.createRequest('/api/administrator/subscriptions/payment-methods?limit=1')
    req2.account = administrator.account
    req2.session = administrator.session
    cachedResponses.limit = await req2.get()
    const req3 = TestHelper.createRequest('/api/administrator/subscriptions/payment-methods?all=true')
    req3.account = administrator.account
    req3.session = administrator.session
    cachedResponses.all = await req3.get()
    const req4 = TestHelper.createRequest('/api/administrator/subscriptions/payment-methods')
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
      const paymentMethodsNow = cachedResponses.offset
      for (let i = 0, len = global.pageSize; i < len; i++) {
        assert.strictEqual(paymentMethodsNow[i].id, cachedPaymentMethods[offset + i])
      }
    })

    it('optional querystring limit (integer)', async () => {
      const limit = 1
      const paymentMethodsNow = cachedResponses.limit
      assert.strictEqual(paymentMethodsNow.length, limit)
    })

    it('optional querystring all (boolean)', async () => {
      const paymentMethodsNow = cachedResponses.all
      assert.strictEqual(paymentMethodsNow.length, cachedPaymentMethods.length)
    })
  })

  describe('returns', () => {
    it('array', async () => {
      const paymentMethodsNow = cachedResponses.returns
      assert.strictEqual(paymentMethodsNow.length, global.pageSize)
    })
  })

  describe('configuration', () => {
    it('environment PAGE_SIZE', async () => {
      global.pageSize = 3
      const paymentMethodsNow = cachedResponses.pageSize
      assert.strictEqual(paymentMethodsNow.length, global.pageSize)
    })
  })
})
