/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')
const TestStripeAccounts = require('../../../../../test-stripe-accounts.js')

describe('/api/user/subscriptions/set-subscription-plan', function () {
  this.timeout(60 * 60 * 1000)
  afterEach(TestHelper.deleteOldWebhooks)
  beforeEach(TestHelper.setupWebhook)
  describe('exceptions', () => {
    describe('invalid-subscriptionid', () => {
      it('missing querystring subscriptionid', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/subscriptions/set-subscription-quantity')
        req.account = user.account
        req.session = user.session
        req.body = {
          planid: 'invalid'
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
        const req = TestHelper.createRequest('/api/user/subscriptions/set-subscription-quantity?subscriptionid=invalid')
        req.account = user.account
        req.session = user.session
        req.body = {
          planid: 'invalid'
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
        const plan2 = await TestHelper.createPlan(administrator, {
          productid: administrator.product.id,
          usage_type: 'licensed',
          published: 'true',
          trial_period_days: '0',
          amount: '2000'
        })
        const user = await TestStripeAccounts.createUserWithPaymentMethod()
        await TestHelper.createSubscription(user, administrator.plan.id)
        const user2 = await TestStripeAccounts.createUserWithPaymentMethod()
        await TestHelper.createSubscription(user2, plan2.id)
        const req = TestHelper.createRequest(`/api/user/subscriptions/set-subscription-plan?subscriptionid=${user.subscription.id}`)
        req.account = user2.account
        req.session = user2.session
        req.body = {
          planid: administrator.plan.id,
          paymentmethodid: user.paymentMethod.id
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

    describe('invalid-planid', () => {
      it('missing posted planid', async () => {
        const administrator = await TestStripeAccounts.createOwnerWithPlan()
        const user = await TestStripeAccounts.createUserWithPaymentMethod()
        await TestHelper.createSubscription(user, administrator.plan.id)
        const req = TestHelper.createRequest(`/api/user/subscriptions/set-subscription-plan?subscriptionid=${user.subscription.id}`)
        req.account = user.account
        req.session = user.session
        req.body = {
          planid: '',
          paymentmethodid: user.paymentMethod.id
        }
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-planid')
      })

      it('invalid posted planid', async () => {
        const administrator = await TestStripeAccounts.createOwnerWithPlan()
        const user = await TestStripeAccounts.createUserWithPaymentMethod()
        await TestHelper.createSubscription(user, administrator.plan.id)
        const req = TestHelper.createRequest(`/api/user/subscriptions/set-subscription-plan?subscriptionid=${user.subscription.id}`)
        req.account = user.account
        req.session = user.session
        req.body = {
          planid: 'invalid',
          paymentmethodid: user.paymentMethod.id
        }
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
      it('invalid posted plan is not published', async () => {
        const administrator = await TestStripeAccounts.createOwnerWithPlan()
        const plan1 = administrator.plan
        const plan2 = await TestHelper.createPlan(administrator, {
          productid: administrator.product.id,
          usage_type: 'licensed',
          trial_period_days: '0',
          amount: '1000'
        })
        const user = await TestStripeAccounts.createUserWithPaymentMethod()
        await TestHelper.createSubscription(user, plan1.id)
        const req = TestHelper.createRequest(`/api/user/subscriptions/set-subscription-plan?subscriptionid=${user.subscription.id}`)
        req.account = user.account
        req.session = user.session
        req.body = {
          planid: plan2.id,
          paymentmethodid: user.paymentMethod.id
        }
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-plan')
      })

      it('invalid posted plan is unpublished', async () => {
        const administrator = await TestStripeAccounts.createOwnerWithPlan()
        const plan1 = administrator.plan
        const plan2 = await TestHelper.createPlan(administrator, {
          productid: administrator.product.id,
          usage_type: 'licensed',
          published: 'true',
          unpublished: 'true',
          trial_period_days: '0',
          amount: '1000'
        })
        const user = await TestStripeAccounts.createUserWithPaymentMethod()
        await TestHelper.createSubscription(user, plan1.id)
        const req = TestHelper.createRequest(`/api/user/subscriptions/set-subscription-plan?subscriptionid=${user.subscription.id}`)
        req.account = user.account
        req.session = user.session
        req.body = {
          planid: plan2.id,
          paymentmethodid: user.paymentMethod.id
        }
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-plan')
      })

      it('invalid posted plan is unchanged', async () => {
        const administrator = await TestStripeAccounts.createOwnerWithPlan()
        const user = await TestStripeAccounts.createUserWithPaymentMethod()
        await TestHelper.createSubscription(user, administrator.plan.id)
        const req = TestHelper.createRequest(`/api/user/subscriptions/set-subscription-plan?subscriptionid=${user.subscription.id}`)
        req.account = user.account
        req.session = user.session
        req.body = {
          planid: administrator.plan.id,
          paymentmethodid: user.paymentMethod.id
        }
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

  describe('invalid-paymentmethodid', () => {
    it('invalid customer requires payments method', async () => {
      const administrator = await TestStripeAccounts.createOwnerWithPlan({ amount: 0 })
      const plan1 = administrator.plan
      const plan2 = await TestHelper.createPlan(administrator, {
        productid: administrator.product.id,
        usage_type: 'licensed',
        published: 'true',
        trial_period_days: '0',
        amount: '2000'
      })
      const user = await TestStripeAccounts.createUserWithPaymentMethod()
      await TestHelper.createSubscription(user, plan1.id)
      const req = TestHelper.createRequest(`/api/user/subscriptions/set-subscription-plan?subscriptionid=${user.subscription.id}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        planid: plan2.id
      }
      let errorMessage
      try {
        await req.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-paymentmethodid')
    })
  })

  describe('returns', () => {
    it('object', async () => {
      const administrator = await TestStripeAccounts.createOwnerWithPlan()
      const plan1 = administrator.plan
      const plan2 = await TestHelper.createPlan(administrator, {
        productid: administrator.product.id,
        usage_type: 'licensed',
        published: 'true',
        amount: '1000'
      })
      const user = await TestStripeAccounts.createUserWithPaymentMethod()
      await TestHelper.createSubscription(user, plan1.id)
      const req = TestHelper.createRequest(`/api/user/subscriptions/set-subscription-plan?subscriptionid=${user.subscription.id}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        planid: plan2.id,
        paymentmethodid: user.paymentMethod.id
      }
      req.filename = __filename
      req.saveResponse = true
      const subscriptionNow = await req.patch()
      assert.strictEqual(subscriptionNow.plan.id, plan2.id)
    })
  })
})
