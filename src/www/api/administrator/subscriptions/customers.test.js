/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')
const DashboardTestHelper = require('@userdashboard/dashboard/test-helper.js')

describe('/api/administrator/subscriptions/customers', function () {
  const cachedResponses = {}
  const cachedCustomers = []
  before(async () => {
    await DashboardTestHelper.setupBeforeEach()
    await TestHelper.setupBeforeEach()
    const administrator = await TestHelper.createOwner()
    for (let i = 0, len = global.pageSize + 2; i < len; i++) {
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user, {
        email: user.profile.contactEmail,
        description: user.profile.firstName
      })
      cachedCustomers.unshift(user.customer.id)
    }
    const offset = 1
    const limit = 1
    const req1 = TestHelper.createRequest(`/api/administrator/subscriptions/customers?offset=${offset}`)
    req1.account = administrator.account
    req1.session = administrator.session
    cachedResponses.offset = await req1.get()
    const req2 = TestHelper.createRequest(`/api/administrator/subscriptions/customers?limit=${limit}`)
    req2.account = administrator.account
    req2.session = administrator.session
    cachedResponses.limit = await req2.get()
    const req3 = TestHelper.createRequest('/api/administrator/subscriptions/customers?all=true')
    req3.account = administrator.account
    req3.session = administrator.session
    cachedResponses.all = await req3.get()
    const req4 = TestHelper.createRequest('/api/administrator/subscriptions/customers')
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
      const customersNow = cachedResponses.offset
      for (let i = 0, len = customersNow.length; i < len; i++) {
        assert.strictEqual(customersNow[i].id, cachedCustomers[i + offset])
      }
    })

    it('optional querystring limit (integer)', async () => {
      const limit = 1
      const customersNow = cachedResponses.limit
      assert.strictEqual(customersNow.length, limit)
    })

    it('optional querystring all (boolean)', async () => {
      const customers = cachedResponses.all
      assert.strictEqual(customers.length, cachedCustomers.length)
    })
  })

  describe('returns', () => {
    it('array', async () => {
      const customers = cachedResponses.returns
      assert.strictEqual(customers.length, global.pageSize)
    })
  })

  describe('configuration', () => {
    it('environment PAGE_SIZE', async () => {
      global.pageSize = 3
      const customers = cachedResponses.pageSize
      assert.strictEqual(customers.length, global.pageSize)
    })
  })
})
