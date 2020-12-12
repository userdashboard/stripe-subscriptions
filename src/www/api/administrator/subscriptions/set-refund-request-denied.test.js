/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')
const TestStripeAccounts = require('../../../../../test-stripe-accounts.js')

describe('/api/administrator/subscriptions/set-refund-request-denied', function () {
  afterEach(TestHelper.deleteOldWebhooks)
  beforeEach(TestHelper.setupWebhook)
  describe('exceptions', () => {
    describe('invalid-chargeid', () => {
      it('missing querystring chargeid', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/subscriptions/set-refund-request-denied')
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          reason: 'no'
        }
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-chargeid')
      })

      it('invalid querystring chargeid', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/subscriptions/set-refund-request-denied?chargeid=invalid')
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          reason: 'no'
        }
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-chargeid')
      })
    })

    describe('invalid-charge', () => {
      it('ineligible querystring charge has no refund request', async () => {
        const administrator = await TestStripeAccounts.createOwnerWithPlan()
        const user = await TestStripeAccounts.createUserWithPaymentMethod()
        await TestHelper.createSubscription(user, administrator.plan.id)
        const req = TestHelper.createRequest(`/api/administrator/subscriptions/set-refund-request-denied?chargeid=${user.charge.id}`)
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          reason: 'no'
        }
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-charge')
      })

      it('ineligible querystring charge has denied request already', async () => {
        const administrator = await TestStripeAccounts.createOwnerWithPlan()
        const user = await TestStripeAccounts.createUserWithPaymentMethod()
        await TestHelper.createSubscription(user, administrator.plan.id)
        await TestHelper.requestRefund(user, user.charge.id)
        await TestHelper.denyRefund(administrator, user, user.charge.id)
        const req = TestHelper.createRequest(`/api/administrator/subscriptions/set-refund-request-denied?chargeid=${user.charge.id}`)
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          reason: 'no'
        }
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-charge')
      })
    })
  })

  describe('returns', () => {
    it('object', async () => {
      const administrator = await TestStripeAccounts.createOwnerWithPlan()
      const user = await TestStripeAccounts.createUserWithPaymentMethod()
      await TestHelper.createSubscription(user, administrator.plan.id)
      await TestHelper.requestRefund(user, user.charge.id)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/set-refund-request-denied?chargeid=${user.charge.id}`)
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        reason: 'no'
      }
      req.filename = __filename
      req.saveResponse = true
      const charge = await req.patch()
      assert.notStrictEqual(charge.metadata.refundDenied, undefined)
      assert.notStrictEqual(charge.metadata.refundDenied, null)
      assert.strictEqual(charge.metadata.refundDeniedReason, 'no')
    })
  })
})
