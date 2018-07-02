/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe(`/api/administrator/subscriptions/update-subscription-coupon`, () => {
  describe('UpdateSubscriptionCoupon#PATCH', () => {
    it('should reject invalid subscriptionid', async () => {
      const administrator = await TestHelper.createAdministrator()
      const coupon = await TestHelper.createCoupon(administrator, {published: true, percent_off: 25, duration: 'repeating', duration_in_months: 3})
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/update-subscription-coupon?subscriptionid=invalid`, 'PATCH')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      req.body = {
        couponid: coupon.id
      }
      let errorMessage
      try {
        await req.route.api.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-subscriptionid')
    })

    it('should reject invalid couponid', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 1000})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, administrator.plan.id)
      await TestHelper.waitForWebhooks(2)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/update-subscription-coupon?subscriptionid=${user.subscription.id}`, 'PATCH')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      req.body = {
        couponid: 'invalid'
      }
      let errorMessage
      try {
        await req.route.api.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-couponid')
    })

    it('should reject unpublished coupon', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 1000})
      const coupon = await TestHelper.createCoupon(administrator, {published: true, percent_off: 25, duration: 'repeating', duration_in_months: 3})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, administrator.plan.id)
      await TestHelper.waitForWebhooks(2)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/update-subscription-coupon?subscriptionid=${user.subscription.id}`, 'PATCH')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      req.body = {
        couponid: coupon.id
      }
      let errorMessage
      try {
        await req.route.api.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-coupon')
    })

    it('should update subscription coupon', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 1000})
      const coupon = await TestHelper.createCoupon(administrator, {published: true, percent_off: 25, duration: 'repeating', duration_in_months: 3})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, administrator.plan.id)
      await TestHelper.waitForWebhooks(2)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/update-subscription-coupon?subscriptionid=${user.subscription.id}`, 'PATCH')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      req.subscription = administrator.subscription
      req.body = {
        couponid: coupon.id
      }
      await req.route.api.patch(req)
      req.session = await TestHelper.unlockSession(administrator)
      await req.route.api.patch(req)
      assert.equal(req.success, true)
    })
  })
})
