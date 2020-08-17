/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')
const TestStripeAccounts = require('../../../../../test-stripe-accounts.js')

describe('/api/user/subscriptions/refund', function () {
  beforeEach(TestHelper.setupWebhook)
  afterEach(TestHelper.deleteOldWebhooks)
  describe('exceptions', () => {
    describe('invalid-refundid', () => {
      it('missing querystring refundid', async () => {
        const user = await TestHelper.createUser()
        await TestHelper.createCustomer(user, {
          email: user.profile.contactEmail,
          description: user.profile.firstName,
          country: 'US'
        })
        const req = TestHelper.createRequest('/api/user/subscriptions/refund?refundid=invalid')
        req.account = user.account
        req.session = user.session
        let errorMessage
        try {
          await req.get()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-refundid')
      })

      it('invalid querystring refundid', async () => {
        const user = await TestHelper.createUser()
        await TestHelper.createCustomer(user, {
          email: user.profile.contactEmail,
          description: user.profile.firstName,
          country: 'US'
        })
        const req = TestHelper.createRequest('/api/user/subscriptions/refund?refundid=invalid')
        req.account = user.account
        req.session = user.session
        let errorMessage
        try {
          await req.get()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-refundid')
      })
    })

    describe('invalid-account', () => {
      it('ineligible accessing account', async () => {
        const administrator = await TestStripeAccounts.createOwnerWithPlan()
        const user = await TestStripeAccounts.createUserWithPaymentMethod()
        await TestHelper.createSubscription(user, administrator.plan.id)
        await TestHelper.createRefund(administrator, user.charge.id)
        const user2 = await TestHelper.createUser()
        await TestHelper.createCustomer(user2, {
          email: user.profile.contactEmail,
          description: user.profile.firstName,
          country: 'US'
        })
        const req = TestHelper.createRequest(`/api/user/subscriptions/refund?refundid=${administrator.refund.id}`)
        req.account = user2.account
        req.session = user2.session
        let errorMessage
        try {
          await req.get()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-account')
      })
    })
  })

  describe('returns', () => {
    it('object', async () => {
      const administrator = await TestStripeAccounts.createOwnerWithPlan({ amount: '10000', interval: 'day' })
      const user = await TestStripeAccounts.createUserWithPaymentMethod()
      await TestHelper.createSubscription(user, administrator.plan.id)
      await TestHelper.createRefund(administrator, user.charge.id)
      const req = TestHelper.createRequest(`/api/user/subscriptions/refund?refundid=${administrator.refund.id}`)
      req.account = user.account
      req.session = user.session
      req.filename = __filename
      req.saveResponse = true
      const refund = await req.get()
      assert.strictEqual(refund.object, 'refund')
    })
  })
})
