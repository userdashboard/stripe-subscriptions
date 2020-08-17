/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/administrator/subscriptions/plans-count', () => {
  describe('returns', () => {
    it('integer', async () => {
      const administrator = await TestHelper.createOwner()
      await TestHelper.createProduct(administrator, {
        published: 'true'
      })
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        await TestHelper.createPlan(administrator, {
          productid: administrator.product.id,
          usage_type: 'licensed',
          published: 'true',
          trial_period_days: '0',
          amount: '1000'
        })
      }
      const req = TestHelper.createRequest('/api/administrator/subscriptions/plans-count')
      req.account = administrator.account
      req.session = administrator.session
      req.filename = __filename
      req.saveResponse = true
      const result = await req.get()
      assert.strictEqual(result, global.pageSize + 1)
    })
  })
})
