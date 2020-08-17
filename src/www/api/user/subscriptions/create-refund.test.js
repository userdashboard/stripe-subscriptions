/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')
const TestStripeAccounts = require('../../../../../test-stripe-accounts.js')

describe('/api/user/subscriptions/create-refund', function () {
  this.timeout(60 * 60 * 1000)
  beforeEach(TestHelper.setupWebhook)
  afterEach(TestHelper.deleteOldWebhooks)
  describe('exceptions', () => {
    describe('invalid-chargeid', () => {
      it('missing querystring chargeid', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/subscriptions/create-refund')
        req.account = user.account
        req.session = user.session
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-chargeid')
      })

      it('invalid querystring chargeid', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/subscriptions/create-refund?chargeid=invalid')
        req.account = user.account
        req.session = user.session
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-chargeid')
      })
    })

    describe('invalid-charge', () => {
      it('ineligible querystring charge is refunded', async () => {
        const administrator = await TestStripeAccounts.createOwnerWithPlan()
        const user = await TestStripeAccounts.createUserWithPaymentMethod()
        await TestHelper.createSubscription(user, administrator.plan.id)
        await TestHelper.createRefund(administrator, user.charge.id)
        const req = TestHelper.createRequest(`/api/user/subscriptions/create-refund?chargeid=${user.charge.id}`)
        req.account = user.account
        req.session = user.session
        req.body = {
          amount: '10000'
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-charge')
      })

      it('ineligible querystring charge is out of refund period', async () => {
        global.subscriptionRefundPeriod = 0
        const administrator = await TestStripeAccounts.createOwnerWithPlan()
        const user = await TestStripeAccounts.createUserWithPaymentMethod()
        await TestHelper.createSubscription(user, administrator.plan.id)
        const req = TestHelper.createRequest(`/api/user/subscriptions/create-refund?chargeid=${user.charge.id}`)
        req.account = user.account
        req.session = user.session
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-charge')
      })
    })

    describe('invalid-account', () => {
      it('ineligible accessing account', async () => {
        const administrator = await TestStripeAccounts.createOwnerWithPlan()
        const user = await TestStripeAccounts.createUserWithPaymentMethod()
        await TestHelper.createSubscription(user, administrator.plan.id)
        const user2 = await TestHelper.createUser()
        await TestHelper.createCustomer(user2, {
          email: user.profile.contactEmail,
          description: user.profile.firstName,
          country: 'US'
        })
        const req = TestHelper.createRequest(`/api/user/subscriptions/create-refund?chargeid=${user.charge.id}`)
        req.account = user2.account
        req.session = user2.session
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-account')
      })
    })
  })

  describe('returns', () => {
    it('object', async () => {
      const administrator = await TestStripeAccounts.createOwnerWithPlan()
      const user = await TestStripeAccounts.createUserWithPaymentMethod()
      await TestHelper.createSubscription(user, administrator.plan.id)
      const req = TestHelper.createRequest(`/api/user/subscriptions/create-refund?chargeid=${user.charge.id}`)
      req.account = user.account
      req.session = user.session
      req.filename = __filename
      req.saveResponse = true
      const refund = await req.post()
      assert.strictEqual(refund.object, 'refund')
    })
  })

  describe('configuration', () => {
    it('environment SUBSCRIPTION_REFUND_PERIOD', async () => {
      global.subscriptionRefundPeriod = 7 * 24 * 60 * 60
      const administrator = await TestStripeAccounts.createOwnerWithPlan()
      const user = await TestStripeAccounts.createUserWithPaymentMethod()
      await TestHelper.createSubscription(user, administrator.plan.id)
      const req = TestHelper.createRequest(`/api/user/subscriptions/create-refund?chargeid=${user.charge.id}`)
      req.account = user.account
      req.session = user.session
      const refund = await req.post()
      assert.strictEqual(refund.object, 'refund')
    })
  })
})
