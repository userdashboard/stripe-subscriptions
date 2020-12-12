/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')
const TestStripeAccounts = require('../../../../../test-stripe-accounts.js')

describe('/api/user/subscriptions/create-usage-record', function () {
  afterEach(TestHelper.deleteOldWebhooks)
  beforeEach(TestHelper.setupWebhook)
  describe('exceptions', () => {
    describe('invalid-subscriptionid', () => {
      it('missing querystring subscriptionid', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/subscriptions/create-usage-record')
        req.account = user.account
        req.session = user.session
        req.body = {
          email: user.profile.contactEmail,
          description: 'customer'
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-subscriptionid')
      })

      it('invalid querystring subscriptionid', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/subscriptions/create-usage-record?subscriptionid=invalid')
        req.account = user.account
        req.session = user.session
        req.body = {
          email: user.profile.contactEmail,
          description: 'customer'
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-subscriptionid')
      })
    })

    describe('invalid-subscription', () => {
      it('invalid querystring subscription is not "metered"', async () => {
        const administrator = await TestStripeAccounts.createOwnerWithPlan({
          usage_type: 'licensed'
        })
        const user = await TestStripeAccounts.createUserWithPaymentMethod()
        await TestHelper.createSubscription(user, administrator.plan.id)
        const req = TestHelper.createRequest(`/api/user/subscriptions/create-usage-record?subscriptionid=${user.subscription.id}`)
        req.account = user.account
        req.session = user.session
        req.body = {
          quantity: '100',
          action: 'set',
          subscriptionitemid: user.subscription.items.data[0].id
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-subscription')
      })
    })

    describe('invalid-account', () => {
      it('ineligible accessing account', async () => {
        const administrator = await TestStripeAccounts.createOwnerWithPlan({
          usage_type: 'metered'
        })
        const user = await TestHelper.createUser()
        const user2 = await TestStripeAccounts.createUserWithPaymentMethod()
        await TestHelper.createSubscription(user2, administrator.plan.id)
        const req = TestHelper.createRequest(`/api/user/subscriptions/create-usage-record?subscriptionid=${user2.subscription.id}`)
        req.account = user.account
        req.session = user.session
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-account')
      })
    })

    describe('invalid-quantity', () => {
      it('invalid posted quantity is not integer', async () => {
        const administrator = await TestStripeAccounts.createOwnerWithPlan({
          usage_type: 'metered'
        })
        const user = await TestStripeAccounts.createUserWithPaymentMethod()
        await TestHelper.createSubscription(user, administrator.plan.id)
        const req = TestHelper.createRequest(`/api/user/subscriptions/create-usage-record?subscriptionid=${user.subscription.id}`)
        req.account = user.account
        req.session = user.session
        req.body = {
          quantity: 'abcde',
          action: 'set',
          subscriptionitemid: user.subscription.items.data[0].id
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-quantity')
      })

      it('invalid posted quantity is negative', async () => {
        const administrator = await TestStripeAccounts.createOwnerWithPlan({
          usage_type: 'metered'
        })
        const user = await TestStripeAccounts.createUserWithPaymentMethod()
        await TestHelper.createSubscription(user, administrator.plan.id)
        const req = TestHelper.createRequest(`/api/user/subscriptions/create-usage-record?subscriptionid=${user.subscription.id}`)
        req.account = user.account
        req.session = user.session
        req.body = {
          quantity: '-100',
          action: 'set',
          subscriptionitemid: user.subscription.items.data[0].id
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-quantity')
      })
    })

    describe('invalid-action', () => {
      it('missing posted action', async () => {
        const administrator = await TestStripeAccounts.createOwnerWithPlan({
          usage_type: 'metered'
        })
        const user = await TestStripeAccounts.createUserWithPaymentMethod()
        await TestHelper.createSubscription(user, administrator.plan.id)
        const req = TestHelper.createRequest(`/api/user/subscriptions/create-usage-record?subscriptionid=${user.subscription.id}`)
        req.account = user.account
        req.session = user.session
        req.body = {
          quantity: '100',
          action: '',
          subscriptionitemid: user.subscription.items.data[0].id
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-action')
      })

      it('invalid posted action', async () => {
        const administrator = await TestStripeAccounts.createOwnerWithPlan({
          usage_type: 'metered'
        })
        const user = await TestStripeAccounts.createUserWithPaymentMethod()
        await TestHelper.createSubscription(user, administrator.plan.id)
        const req = TestHelper.createRequest(`/api/user/subscriptions/create-usage-record?subscriptionid=${user.subscription.id}`)
        req.account = user.account
        req.session = user.session
        req.body = {
          quantity: '100',
          action: 'invalid',
          subscriptionitemid: user.subscription.items.data[0].id
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-action')
      })
    })

    describe('invalid-subscriptionitemid', () => {
      it('missing posted subscriptionitemid', async () => {
        const administrator = await TestStripeAccounts.createOwnerWithPlan({
          usage_type: 'metered'
        })
        const user = await TestStripeAccounts.createUserWithPaymentMethod()
        await TestHelper.createSubscription(user, administrator.plan.id)
        const req = TestHelper.createRequest(`/api/user/subscriptions/create-usage-record?subscriptionid=${user.subscription.id}`)
        req.account = user.account
        req.session = user.session
        req.body = {
          quantity: '100',
          action: 'set',
          subscriptionitemid: ''
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-subscriptionitemid')
      })

      it('invalid posted subscriptionitemid', async () => {
        const administrator = await TestStripeAccounts.createOwnerWithPlan({
          usage_type: 'metered'
        })
        const user = await TestStripeAccounts.createUserWithPaymentMethod()
        await TestHelper.createSubscription(user, administrator.plan.id)
        const req = TestHelper.createRequest(`/api/user/subscriptions/create-usage-record?subscriptionid=${user.subscription.id}`)
        req.account = user.account
        req.session = user.session
        req.body = {
          quantity: '100',
          action: 'set',
          subscriptionitemid: 'invalid'
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-subscriptionitemid')
      })
    })
  })

  describe('receives', () => {
    it('required posted quantity', async () => {
      const administrator = await TestStripeAccounts.createOwnerWithPlan({
        usage_type: 'metered'
      })
      const user = await TestStripeAccounts.createUserWithPaymentMethod()
      await TestHelper.createSubscription(user, administrator.plan.id)
      const req = TestHelper.createRequest(`/api/user/subscriptions/create-usage-record?subscriptionid=${user.subscription.id}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        quantity: '100',
        action: 'set',
        subscriptionitemid: user.subscription.items.data[0].id
      }
      const usageRecord = await req.post()
      assert.strictEqual(usageRecord.quantity, 100)
    })

    it('required posted action', async () => {
      const administrator = await TestStripeAccounts.createOwnerWithPlan({
        usage_type: 'metered'
      })
      const user = await TestStripeAccounts.createUserWithPaymentMethod()
      await TestHelper.createSubscription(user, administrator.plan.id)
      const req = TestHelper.createRequest(`/api/user/subscriptions/create-usage-record?subscriptionid=${user.subscription.id}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        quantity: '100',
        action: 'set',
        subscriptionitemid: user.subscription.items.data[0].id
      }
      const usageRecord = await req.post()
      assert.strictEqual(usageRecord.quantity, 100)
      // TODO: thections can be verified setting/incrementing
      // when the usage record summaries are aavailable
    })

    it('required posted subscriptionitemid', async () => {
      const administrator = await TestStripeAccounts.createOwnerWithPlan({
        usage_type: 'metered'
      })
      const user = await TestStripeAccounts.createUserWithPaymentMethod()
      await TestHelper.createSubscription(user, administrator.plan.id)
      const req = TestHelper.createRequest(`/api/user/subscriptions/create-usage-record?subscriptionid=${user.subscription.id}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        quantity: '100',
        action: 'set',
        subscriptionitemid: user.subscription.items.data[0].id
      }
      const usageRecord = await req.post()
      assert.strictEqual(usageRecord.subscription_item, user.subscription.items.data[0].id)
    })
  })

  describe('returns', () => {
    it('object', async () => {
      const administrator = await TestStripeAccounts.createOwnerWithPlan({
        usage_type: 'metered'
      })
      const user = await TestStripeAccounts.createUserWithPaymentMethod()
      await TestHelper.createSubscription(user, administrator.plan.id)
      const req = TestHelper.createRequest(`/api/user/subscriptions/create-usage-record?subscriptionid=${user.subscription.id}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        quantity: '100',
        action: 'set',
        subscriptionitemid: user.subscription.items.data[0].id
      }
      req.filename = __filename
      req.saveResponse = true
      const usageRecord = await req.post()
      assert.strictEqual(usageRecord.object, 'usage_record')
    })
  })
})
