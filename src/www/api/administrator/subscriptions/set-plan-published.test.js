/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')
const TestStripeAccounts = require('../../../../../test-stripe-accounts.js')

describe('/api/administrator/subscriptions/set-plan-published', () => {
  describe('exceptions', () => {
    describe('invalid-planid', () => {
      it('missing querystring planid', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/subscriptions/set-plan-published')
        req.account = administrator.account
        req.session = administrator.session
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-planid')
      })

      it('invalid querystring planid', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/subscriptions/set-plan-published?planid=invalid')
        req.account = administrator.account
        req.session = administrator.session
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-planid')
      })
    })

    describe('invalid-plan', () => {
      it('ineligible querystring plan is published', async () => {
        const administrator = await TestStripeAccounts.createOwnerWithPlan()
        const req = TestHelper.createRequest(`/api/administrator/subscriptions/set-plan-published?planid=${administrator.plan.id}`)
        req.account = administrator.account
        req.session = administrator.session
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-plan')
      })
    })
  })

  describe('returns', () => {
    it('object', async () => {
      const administrator = await TestStripeAccounts.createOwnerWithNotPublishedPlan()
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/set-plan-published?planid=${administrator.plan.id}`)
      req.account = administrator.account
      req.session = administrator.session
      req.filename = __filename
      req.saveResponse = true
      const plan = await req.patch()
      assert.notStrictEqual(plan.metadata.published, undefined)
      assert.notStrictEqual(plan.metadata.published, null)
    })
  })
})
