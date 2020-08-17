/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/administrator/subscriptions/coupons-count', () => {
  describe('returns', () => {
    it('integer', async () => {
      const administrator = await TestHelper.createOwner()
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
        await TestHelper.createCoupon(administrator, {
          published: 'true',
          percent_off: '25',
          duration: 'repeating',
          duration_in_months: '3'
        })
      }
      const req = TestHelper.createRequest('/api/administrator/subscriptions/coupons-count')
      req.account = administrator.account
      req.session = administrator.session
      req.filename = __filename
      req.saveResponse = true
      const result = await req.get()
      assert.strictEqual(result, global.pageSize + 1)
    })
  })
})
