/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')
const TestStripeAccounts = require('../../../../../test-stripe-accounts.js')

describe('/api/user/subscriptions/set-subscription-coupon', function () {
  this.timeout(60 * 60 * 1000)
  afterEach(TestHelper.deleteOldWebhooks)
  beforeEach(TestHelper.setupWebhook)
  describe('exceptions', () => {
    describe('invalid-subscriptionid', () => {
      it('missing querystring subscriptionid', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/subscriptions/set-subscription-coupon')
        req.account = user.account
        req.session = user.session
        req.body = {
          couponid: 'invalid'
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
        const req = TestHelper.createRequest('/api/user/subscriptions/set-subscription-coupon?subscriptionid=invalid')
        req.account = user.account
        req.session = user.session
        req.body = {
          couponid: 'invalid'
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

    describe('invalid-subscription', () => {
      it('invalid querystring subscription has coupon', async () => {
        const administrator = await TestStripeAccounts.createOwnerWithPlan()
        const coupon1 = await TestHelper.createCoupon(administrator, {
          published: 'true',
          percent_off: '25'
        })
        const coupon2 = await TestHelper.createCoupon(administrator, {
          published: 'true',
          percent_off: '25'
        })
        const user = await TestStripeAccounts.createUserWithPaymentMethod()
        await TestHelper.createSubscription(user, administrator.plan.id)
        await TestHelper.createSubscriptionDiscount(administrator, user.subscription, coupon1)
        const req = TestHelper.createRequest(`/api/user/subscriptions/set-subscription-coupon?subscriptionid=${user.subscription.id}`)
        req.account = user.account
        req.session = user.session
        req.body = {
          couponid: coupon2.id
        }
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-subscription')
      })

      it('invalid querystring subscription is canceling', async () => {
        const administrator = await TestStripeAccounts.createOwnerWithPlan()
        const coupon = await TestHelper.createCoupon(administrator, {
          published: 'true',
          percent_off: '25'
        })
        const user = await TestStripeAccounts.createUserWithPaymentMethod()
        await TestHelper.createSubscription(user, administrator.plan.id)
        await TestHelper.cancelSubscription(user)
        const req = TestHelper.createRequest(`/api/user/subscriptions/set-subscription-coupon?subscriptionid=${user.subscription.id}`)
        req.account = user.account
        req.session = user.session
        req.body = {
          couponid: coupon.id
        }
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-subscription')
      })
    })

    describe('invalid-account', () => {
      it('ineligible accessing account', async () => {
        const administrator = await TestStripeAccounts.createOwnerWithPlan()
        const coupon = await TestHelper.createCoupon(administrator, {
          published: 'true',
          percent_off: '25'
        })
        const user = await TestStripeAccounts.createUserWithPaymentMethod()
        await TestHelper.createSubscription(user, administrator.plan.id)
        const user2 = await TestHelper.createUser()
        const req = TestHelper.createRequest(`/api/user/subscriptions/set-subscription-coupon?subscriptionid=${user.subscription.id}`)
        req.account = user2.account
        req.session = user2.session
        req.body = {
          couponid: coupon.id
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

    describe('invalid-couponid', () => {
      it('missing posted couponid', async () => {
        const administrator = await TestStripeAccounts.createOwnerWithPlan()
        const user = await TestStripeAccounts.createUserWithPaymentMethod()
        await TestHelper.createSubscription(user, administrator.plan.id)
        const req = TestHelper.createRequest(`/api/user/subscriptions/set-subscription-coupon?subscriptionid=${user.subscription.id}`)
        req.account = user.account
        req.session = user.session
        req.body = {
          couponid: ''
        }
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-couponid')
      })

      it('invalid posted couponid', async () => {
        const administrator = await TestStripeAccounts.createOwnerWithPlan()
        const user = await TestStripeAccounts.createUserWithPaymentMethod()
        await TestHelper.createSubscription(user, administrator.plan.id)
        const req = TestHelper.createRequest(`/api/user/subscriptions/set-subscription-coupon?subscriptionid=${user.subscription.id}`)
        req.account = user.account
        req.session = user.session
        req.body = {
          couponid: 'invalid'
        }
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-couponid')
      })
    })

    describe('invalid-coupon', () => {
      it('invalid posted coupon is not published', async () => {
        const administrator = await TestStripeAccounts.createOwnerWithPlan()
        const coupon = await TestHelper.createCoupon(administrator, {
          percent_off: '25'
        })
        const user = await TestStripeAccounts.createUserWithPaymentMethod()
        await TestHelper.createSubscription(user, administrator.plan.id)
        const req = TestHelper.createRequest(`/api/user/subscriptions/set-subscription-coupon?subscriptionid=${user.subscription.id}`)
        req.account = user.account
        req.session = user.session
        req.body = {
          couponid: coupon.id
        }
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-coupon')
      })

      it('invalid posted coupon is unpublished', async () => {
        const administrator = await TestStripeAccounts.createOwnerWithPlan()
        const coupon = await TestHelper.createCoupon(administrator, {
          percent_off: '25',
          published: 'true',
          unpublished: 'true'
        })
        const user = await TestStripeAccounts.createUserWithPaymentMethod()
        await TestHelper.createSubscription(user, administrator.plan.id)
        const req = TestHelper.createRequest(`/api/user/subscriptions/set-subscription-coupon?subscriptionid=${user.subscription.id}`)
        req.account = user.account
        req.session = user.session
        req.body = {
          couponid: coupon.id
        }
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-coupon')
      })

      it('invalid posted coupon is other currency', async () => {
        const administrator = await TestStripeAccounts.createOwnerWithPlan()
        const coupon = await TestHelper.createCoupon(administrator, {
          amount_off: '2500',
          currency: 'jpy'
        })
        const user = await TestStripeAccounts.createUserWithPaymentMethod()
        await TestHelper.createSubscription(user, administrator.plan.id)
        const req = TestHelper.createRequest(`/api/user/subscriptions/set-subscription-coupon?subscriptionid=${user.subscription.id}`)
        req.account = user.account
        req.session = user.session
        req.body = {
          couponid: coupon.id
        }
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-coupon')
      })
    })
  })

  describe('returns', () => {
    it('object', async () => {
      const administrator = await TestStripeAccounts.createOwnerWithPlan()
      const coupon = await TestHelper.createCoupon(administrator, {
        published: 'true',
        percent_off: '25'
      })
      const user = await TestStripeAccounts.createUserWithPaymentMethod()
      await TestHelper.createSubscription(user, administrator.plan.id)
      const req = TestHelper.createRequest(`/api/user/subscriptions/set-subscription-coupon?subscriptionid=${user.subscription.id}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        couponid: coupon.id
      }
      req.filename = __filename
      req.saveResponse = true
      const subscriptionNow = await req.patch()
      assert.strictEqual(subscriptionNow.discount.coupon.id, coupon.id)
    })
  })
})
