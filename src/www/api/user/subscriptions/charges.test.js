/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')
const TestStripeAccounts = require('../../../../../test-stripe-accounts.js')
const DashboardTestHelper = require('@userdashboard/dashboard/test-helper.js')

describe('/api/user/subscriptions/charges', function () {
  this.timeout(60 * 60 * 1000)
  const cachedResponses = {}
  const cachedCharges = []
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
        amount: '1000'
      })
      await TestHelper.createCustomer(user, {
        email: user.profile.contactEmail,
        description: user.profile.firstName
      })
      await TestHelper.createPaymentMethod(user, {
        cvc: '111',
        number: '4111111111111111',
        exp_month: '1',
        exp_year: (new Date().getFullYear() + 1).toString().substring(2),
        name: user.profile.firstName + ' ' + user.profile.lastName,
        address_line1: '285 Fulton St',
        address_line2: 'Apt 893',
        address_city: 'New York',
        address_state: 'NY',
        address_zip: '90120',
        address_country: 'US',
        default: 'true'
      })
      await TestHelper.createSubscription(user, administrator.plan.id)
      cachedCharges.unshift(user.charge.id)
      await TestHelper.deleteOldWebhooks()
      await TestHelper.setupWebhook()
    }
    const req1 = TestHelper.createRequest(`/api/user/subscriptions/charges?accountid=${user.account.accountid}&offset=1`)
    req1.account = user.account
    req1.session = user.session
    cachedResponses.offset = await req1.get()
    const req2 = TestHelper.createRequest(`/api/user/subscriptions/charges?accountid=${user.account.accountid}&limit=1`)
    req2.account = user.account
    req2.session = user.session
    cachedResponses.limit = await req2.get()
    const req3 = TestHelper.createRequest(`/api/user/subscriptions/charges?accountid=${user.account.accountid}&all=true`)
    req3.account = user.account
    req3.session = user.session
    cachedResponses.all = await req3.get()
    const req4 = TestHelper.createRequest(`/api/user/subscriptions/charges?accountid=${user.account.accountid}`)
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
        const req = TestHelper.createRequest('/api/user/subscriptions/charges')
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
        const req = TestHelper.createRequest('/api/user/subscriptions/charges?accountid=invalid')
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
        const req = TestHelper.createRequest(`/api/user/subscriptions/charges?accountid=${user.account.accountid}`)
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
      const chargesNow = cachedResponses.offset
      for (let i = 0, len = global.pageSize; i < len; i++) {
        assert.strictEqual(chargesNow[i].id, cachedCharges[offset + i])
      }
    })

    it('optional querystring limit (integer)', async () => {
      const limit = 1
      const chargesNow = cachedResponses.limit
      assert.strictEqual(chargesNow.length, limit)
    })

    it('optional querystring all (boolean)', async () => {
      const chargesNow = cachedResponses.all
      assert.strictEqual(chargesNow.length, cachedCharges.length)
    })
  })

  describe('returns', () => {
    it('array', async () => {
      const chargesNow = cachedResponses.returns
      assert.strictEqual(chargesNow.length, global.pageSize)
    })
  })

  describe('configuration', () => {
    it('environment PAGE_SIZE', async () => {
      global.pageSize = 3
      const chargesNow = cachedResponses.pageSize
      assert.strictEqual(chargesNow.length, global.pageSize)
    })
  })
})
