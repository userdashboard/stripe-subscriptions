/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')
const TestStripeAccounts = require('../../../../../test-stripe-accounts.js')

describe('/api/user/subscriptions/set-subscription-tax-percent', function () {
  this.timeout(30 * 60 * 1000)
  afterEach(TestHelper.deleteOldWebhooks)
  beforeEach(TestHelper.setupWebhook)
  describe('exceptions', () => {
    describe('invalid-subscriptionid', () => {
      it('missing querystring subscriptionid', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/subscriptions/set-subscription-tax-percent')
        req.account = user.account
        req.session = user.session
        req.body = {
          tax_percent: '10'
        }
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-subscriptionid')
      })

      it('invalid querystring subscriptionid', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/subscriptions/set-subscription-tax-percent?subscriptionid=invalid')
        req.account = user.account
        req.session = user.session
        req.body = {
          tax_percent: '10'
        }
        let errorMessage
        try {
          await req.patch(req)
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
        const req = TestHelper.createRequest(`/api/user/subscriptions/set-subscription-tax-percent?subscriptionid=${user.subscription.id}`)
        req.account = user2.account
        req.session = user2.session
        req.body = {
          tax_percent: '10'
        }
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-account')
      })
    })

    describe('invalid-tax_percent', () => {
      it('invalid posted tax_percent', async () => {
        const administrator = await TestStripeAccounts.createOwnerWithPlan()
        const user = await TestStripeAccounts.createUserWithPaymentMethod()
        await TestHelper.createSubscription(user, administrator.plan.id)
        const req = TestHelper.createRequest(`/api/user/subscriptions/set-subscription-tax-percent?subscriptionid=${user.subscription.id}`)
        req.account = user.account
        req.session = user.session
        req.body = {
          tax_percent: 'invalid'
        }
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-tax_percent')
      })

      it('invalid posted tax_percent is unchanged', async () => {
        const administrator = await TestStripeAccounts.createOwnerWithPlan()
        const user = await TestStripeAccounts.createUserWithPaymentMethod()
        await TestHelper.createSubscription(user, administrator.plan.id)
        const req = TestHelper.createRequest(`/api/user/subscriptions/set-subscription-tax-percent?subscriptionid=${user.subscription.id}`)
        req.account = user.account
        req.session = user.session
        req.body = {
          tax_percent: '0'
        }
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-tax_percent')
      })

      it('invalid posted tax_percent is negative', async () => {
        const administrator = await TestStripeAccounts.createOwnerWithPlan()
        const user = await TestStripeAccounts.createUserWithPaymentMethod()
        await TestHelper.createSubscription(user, administrator.plan.id)
        const req = TestHelper.createRequest(`/api/user/subscriptions/set-subscription-tax-percent?subscriptionid=${user.subscription.id}`)
        req.account = user.account
        req.session = user.session
        req.body = {
          tax_percent: '-20'
        }
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-tax_percent')
      })
    })
  })

  describe('returns', () => {
    it('object', async () => {
      const administrator = await TestStripeAccounts.createOwnerWithPlan()
      const user = await TestStripeAccounts.createUserWithPaymentMethod()
      await TestHelper.createSubscription(user, administrator.plan.id)
      const req = TestHelper.createRequest(`/api/user/subscriptions/set-subscription-tax-percent?subscriptionid=${user.subscription.id}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        tax_percent: '10'
      }
      req.filename = __filename
      req.saveResponse = true
      const subscriptionNow = await req.patch()
      assert.strictEqual(subscriptionNow.tax_percent, 10)
    })
  })
})
