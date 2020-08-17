/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')
const TestStripeAccounts = require('../../../../../test-stripe-accounts.js')

describe('/api/administrator/subscriptions/set-subscription-coupon', function () {
  this.timeout(60 * 60 * 1000)
  afterEach(TestHelper.deleteOldWebhooks)
  beforeEach(TestHelper.setupWebhook)
  describe('exceptions', () => {
    describe('invalid-subscriptionid', () => {
      it('missing querystring subscriptionid', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/subscriptions/set-subscription-coupon')
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          couponid: 'fake'
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
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/subscriptions/set-subscription-coupon?subscriptionid=invalid')
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          couponid: 'fake'
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
      it('ineligible subscription is canceling', async () => {
        const administrator = await TestStripeAccounts.createOwnerWithPlan()
        await TestHelper.createCoupon(administrator, {
          published: 'true',
          percent_off: '25',
          duration: 'repeating',
          duration_in_months: '3'
        })
        const user = await TestStripeAccounts.createUserWithPaymentMethod()
        await TestHelper.createSubscription(user, administrator.plan.id)
        await TestHelper.cancelSubscription(user)
        const req = TestHelper.createRequest(`/api/administrator/subscriptions/set-subscription-coupon?subscriptionid=${user.subscription.id}`)
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          couponid: administrator.coupon.id
        }
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-subscription')
      })

      it('ineligible subscription has coupon', async () => {
        const administrator = await TestStripeAccounts.createOwnerWithPlan()
        await TestHelper.createCoupon(administrator, {
          published: 'true',
          percent_off: '25',
          duration: 'repeating',
          duration_in_months: '3'
        })
        const user = await TestStripeAccounts.createUserWithPaymentMethod()
        await TestHelper.createSubscription(user, administrator.plan.id)
        await TestHelper.createSubscriptionDiscount(administrator, user.subscription, administrator.coupon)
        const req = TestHelper.createRequest(`/api/administrator/subscriptions/set-subscription-coupon?subscriptionid=${user.subscription.id}`)
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          couponid: administrator.coupon.id
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

    describe('invalid-couponid', () => {
      it('missing posted couponid', async () => {
        const administrator = await TestStripeAccounts.createOwnerWithPlan()
        const user = await TestStripeAccounts.createUserWithPaymentMethod()
        await TestHelper.createSubscription(user, administrator.plan.id)
        const req = TestHelper.createRequest(`/api/administrator/subscriptions/set-subscription-coupon?subscriptionid=${user.subscription.id}`)
        req.account = administrator.account
        req.session = administrator.session
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
        const req = TestHelper.createRequest(`/api/administrator/subscriptions/set-subscription-coupon?subscriptionid=${user.subscription.id}`)
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          couponid: 'fake'
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
      it('ineligible posted coupon is not published', async () => {
        const administrator = await TestStripeAccounts.createOwnerWithPlan()
        await TestHelper.createCoupon(administrator, {
          percent_off: '25',
          duration: 'repeating',
          duration_in_months: '3'
        })
        const user = await TestStripeAccounts.createUserWithPaymentMethod()
        await TestHelper.createSubscription(user, administrator.plan.id)
        const req = TestHelper.createRequest(`/api/administrator/subscriptions/set-subscription-coupon?subscriptionid=${user.subscription.id}`)
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          couponid: administrator.coupon.id
        }
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-coupon')
      })

      it('ineligible posted coupon is unpublished', async () => {
        const administrator = await TestStripeAccounts.createOwnerWithPlan()
        await TestHelper.createCoupon(administrator, {
          published: 'true',
          unpublished: 'true',
          percent_off: '25',
          duration: 'repeating',
          duration_in_months: '3'
        })
        const user = await TestStripeAccounts.createUserWithPaymentMethod()
        await TestHelper.createSubscription(user, administrator.plan.id)
        const req = TestHelper.createRequest(`/api/administrator/subscriptions/set-subscription-coupon?subscriptionid=${user.subscription.id}`)
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          couponid: administrator.coupon.id
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
      await TestHelper.createCoupon(administrator, {
        published: 'true',
        percent_off: '25',
        duration: 'repeating',
        duration_in_months: '3'
      })
      const user = await TestStripeAccounts.createUserWithPaymentMethod()
      await TestHelper.createSubscription(user, administrator.plan.id)
      await TestHelper.requestRefund(user, user.charge.id)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/set-subscription-coupon?subscriptionid=${user.subscription.id}`)
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        couponid: administrator.coupon.id
      }
      req.filename = __filename
      req.saveResponse = true
      const subscriptionNow = await req.patch()
      assert.strictEqual(subscriptionNow.discount.coupon.id, administrator.coupon.id)
    })
  })
})
