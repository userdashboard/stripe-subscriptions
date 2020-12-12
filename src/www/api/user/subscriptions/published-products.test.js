/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')
const DashboardTestHelper = require('@userdashboard/dashboard/test-helper.js')

describe('/api/user/subscriptions/published-products', function () {
  const cachedResponses = {}
  const cachedProducts = []
  before(async () => {
    await DashboardTestHelper.setupBeforeEach()
    await TestHelper.setupBeforeEach()
    const administrator = await TestHelper.createOwner()
    const user = await TestHelper.createUser()
    for (let i = 0, len = global.pageSize + 2; i < len; i++) {
      await TestHelper.createProduct(administrator, {
        published: 'true'
      })
      cachedProducts.unshift(administrator.product.id)
    }
    const req1 = TestHelper.createRequest('/api/user/subscriptions/published-products?offset=1')
    req1.account = user.account
    req1.session = user.session
    cachedResponses.offset = await req1.get()
    const req2 = TestHelper.createRequest('/api/user/subscriptions/published-products?limit=1')
    req2.account = user.account
    req2.session = user.session
    cachedResponses.limit = await req2.get()
    const req3 = TestHelper.createRequest('/api/user/subscriptions/published-products?all=true')
    req3.account = user.account
    req3.session = user.session
    cachedResponses.all = await req3.get()
    const req4 = TestHelper.createRequest('/api/user/subscriptions/published-products')
    req4.account = user.account
    req4.session = user.session
    req4.filename = __filename
    req4.saveResponse = true
    cachedResponses.returns = await req4.get()
    global.pageSize = 3
    cachedResponses.pageSize = await req4.get()
  })
  describe('receives', () => {
    it('optional querystring offset (integer)', async () => {
      const offset = 1
      const productsNow = cachedResponses.offset
      for (let i = 0, len = global.pageSize; i < len; i++) {
        assert.strictEqual(productsNow[i].id, cachedProducts[offset + i])
      }
    })

    it('optional querystring limit (integer)', async () => {
      const limit = 1
      const productsNow = cachedResponses.limit
      assert.strictEqual(productsNow.length, limit)
    })

    it('optional querystring all (boolean)', async () => {
      const productsNow = cachedResponses.all
      assert.strictEqual(productsNow.length, cachedProducts.length)
    })
  })

  describe('returns', () => {
    it('array', async () => {
      const products = cachedResponses.returns
      assert.strictEqual(products.length, global.pageSize)
    })
  })

  describe('configuration', () => {
    it('environment PAGE_SIZE', async () => {
      global.pageSize = 3
      const products = cachedResponses.pageSize
      assert.strictEqual(products.length, global.pageSize)
    })
  })
})
