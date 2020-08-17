/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/user/subscriptions/published-plans-count', () => {
  describe('returns', () => {
    it('integer', async () => {
      const administrator = await TestHelper.createOwner()
      const product = await TestHelper.createProduct(administrator, {
        published: 'true'
      })
      await TestHelper.createPlan(administrator, {
        productid: product.id,
        usage_type: 'licensed',
        published: 'true',
        amount: 100000,
        trial_period_days: 0
      })
      await TestHelper.createPlan(administrator, {
        productid: product.id,
        usage_type: 'licensed',
        published: 'true'
      })
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user, {
        email: user.profile.contactEmail,
        description: user.profile.firstName
      })
      const req = TestHelper.createRequest('/api/user/subscriptions/published-plans-count')
      req.account = user.account
      req.session = user.session
      req.filename = __filename
      req.saveResponse = true
      const result = await req.get()
      assert.strictEqual(result, global.pageSize)
    })
  })
})
