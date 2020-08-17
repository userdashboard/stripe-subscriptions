/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')
const TestStripeAccounts = require('../../../../../test-stripe-accounts.js')

describe('/api/user/subscriptions/delete-subscription', function () {
  this.timeout(60 * 60 * 1000)
  afterEach(TestHelper.deleteOldWebhooks)
  beforeEach(TestHelper.setupWebhook)
  describe('exceptions', () => {
    describe('invalid-subscriptionid', () => {
      it('missing querystring subscriptionid', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/subscriptions/delete-subscription')
        req.account = user.account
        req.session = user.session
        req.body = {
          refund: 'at_period_end'
        }
        let errorMessage
        try {
          await req.delete()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-subscriptionid')
      })

      it('invalid querystring subscriptionid', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/subscriptions/delete-subscription?subscriptionid=invalid')
        req.account = user.account
        req.session = user.session
        let errorMessage
        try {
          await req.delete()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-subscriptionid')
      })
    })

    describe('invalid-account', () => {
      it('ineligible accessing account', async () => {
        const administrator = await TestStripeAccounts.createOwnerWithPlan()
        const user = await TestStripeAccounts.createUserWithPaymentMethod()
        await TestHelper.createSubscription(user, administrator.plan.id)
        const user2 = await TestHelper.createUser()
        const req = TestHelper.createRequest(`/api/user/subscriptions/set-subscription-canceled?subscriptionid=${user.subscription.id}`)
        req.account = user2.account
        req.session = user2.session
        req.body = {
          refund: 'at_period_end'
        }
        let errorMessage
        try {
          await req.patch()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-account')
      })
    })

    describe('invalid-subscription', () => {
      it('ineligible querystring subscription is not active', async () => {
        const administrator = await TestStripeAccounts.createOwnerWithPlan()
        const user = await TestStripeAccounts.createUserWithPaymentMethod()
        await TestHelper.createSubscription(user, administrator.plan.id)
        await TestHelper.cancelSubscription(user)
        const req2 = TestHelper.createRequest(`/api/user/subscriptions/delete-subscription?subscriptionid=${user.subscription.id}`)
        req2.account = user.account
        req2.session = user.session
        let errorMessage
        try {
          await req2.delete()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-subscription')
      })
    })
  })

  describe('returns', () => {
    it('boolean', async () => {
      const administrator = await TestStripeAccounts.createOwnerWithPlan()
      const user = await TestStripeAccounts.createUserWithPaymentMethod()
      await TestHelper.createSubscription(user, administrator.plan.id)
      const req = TestHelper.createRequest(`/api/user/subscriptions/delete-subscription?subscriptionid=${user.subscription.id}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        refund: 'credit'
      }
      req.filename = __filename
      req.saveResponse = true
      const deleted = await req.delete()
      assert.strictEqual(deleted, true)
    })
  })
})
