/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')
const TestStripeAccounts = require('../../../../../test-stripe-accounts.js')

describe('/api/user/subscriptions/published-plan', () => {
  describe('exceptions', () => {
    describe('invalid-planid', () => {
      it('missing querystring planid', async () => {
        const req = TestHelper.createRequest('/api/user/subscriptions/published-plan')
        let errorMessage
        try {
          await req.get()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-planid')
      })

      it('invalid querystring planid', async () => {
        const req = TestHelper.createRequest('/api/user/subscriptions/published-plan?planid=invalid')
        let errorMessage
        try {
          await req.get()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-planid')
      })
    })

    describe('invalid-plan', () => {
      it('ineligible querystring plan is not published', async () => {
        const administrator = await TestStripeAccounts.createOwnerWithNotPublishedPlan()
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest(`/api/user/subscriptions/published-plan?planid=${administrator.plan.id}`)
        req.account = user.account
        req.session = user.session
        let errorMessage
        try {
          await req.get()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-plan')
      })
    })
  })

  describe('returns', () => {
    it('object', async () => {
      const administrator = await TestStripeAccounts.createOwnerWithPlan()
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/subscriptions/published-plan?planid=${administrator.plan.id}`)
      req.account = user.account
      req.session = user.session
      req.filename = __filename
      req.saveResponse = true
      const plan = await req.get()
      assert.strictEqual(plan.id, administrator.plan.id)
    })
  })
})
