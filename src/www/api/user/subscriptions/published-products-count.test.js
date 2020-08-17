/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/user/subscriptions/published-products-count', () => {
  describe('returns', () => {
    it('integer', async () => {
      const administrator = await TestHelper.createOwner()
      await TestHelper.createProduct(administrator, {
        published: 'true'
      })
      await TestHelper.createProduct(administrator, {
        published: 'true'
      })
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/api/user/subscriptions/published-products-count')
      req.account = user.account
      req.session = user.session
      req.filename = __filename
      req.saveResponse = true
      const result = await req.get()
      assert.strictEqual(result, global.pageSize)
    })
  })
})
