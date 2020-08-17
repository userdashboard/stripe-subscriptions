/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')
const TestStripeAccounts = require('../../../../../test-stripe-accounts.js')

describe('/api/administrator/subscriptions/delete-plan', () => {
  describe('exceptions', () => {
    describe('invalid-planid', () => {
      it('missing querystring planid', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/subscriptions/delete-plan')
        req.account = administrator.account
        req.session = administrator.session
        let errorMessage
        try {
          await req.delete()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-planid')
      })

      it('invalid querystring planid', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/subscriptions/delete-plan?planid=invalid')
        req.account = administrator.account
        req.session = administrator.session
        let errorMessage
        try {
          await req.delete()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-planid')
      })
    })
  })

  describe('returns', () => {
    it('boolean', async () => {
      const administrator = await TestStripeAccounts.createOwnerWithPlan()
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/delete-plan?planid=${administrator.plan.id}`)
      req.account = administrator.account
      req.session = administrator.session
      req.filename = __filename
      req.saveResponse = true
      const deleted = await req.delete()
      assert.strictEqual(deleted, true)
    })
  })
})
