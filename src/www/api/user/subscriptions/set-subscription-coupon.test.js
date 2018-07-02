/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe(`/api/user/subscriptions/set-subscription-coupon`, () => {
  describe('SetSubscriptionCoupon#PATCH', () => {
    it('should reject invalid couponid', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      const req = TestHelper.createRequest(`/api/user/subscriptions/set-subscription-coupon?subscriptionid=invalid`, 'PATCH')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
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

    it('should reject account with coupon', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 10000})
      const coupon1 = await TestHelper.createCoupon(administrator)
      const coupon2 = await TestHelper.createCoupon(administrator)
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, plan.id)
      await TestHelper.waitForWebhooks(2)
      await TestHelper.createSubscriptionDiscount(user, coupon1.id)
      await TestHelper.waitForWebhooks(3)
      const user2 = await TestHelper.createUser()
      await TestHelper.createCustomer(user2)
      await TestHelper.createCard(user2)
      const req = TestHelper.createRequest(`/api/user/subscriptions/set-subscription-coupon?subscrpitionid=${user.subscription.id}`, 'GET')
      req.account = user2.account
      req.session = user2.session
      req.customer = user2.customer
      req.body = {
        couponid: coupon2.id
      }
      let errorMessage
      try {
        await req.route.api.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-account')
    })

    it('should apply coupon', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan = await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 10000})
      const coupon = await TestHelper.createCoupon(administrator)
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, plan.id)
      await TestHelper.waitForWebhooks(2)
      const user2 = await TestHelper.createUser()
      await TestHelper.createCustomer(user2)
      await TestHelper.createCard(user2)
      const req = TestHelper.createRequest(`/api/user/subscriptions/set-subscription-coupon?couponidsubscrpitionid=${user.subscription.id}`, 'PATCH')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      req.body = {
        couponid: coupon.id
      }
      await req.route.api.patch(req)
      req.session = await TestHelper.unlockSession(user)
      await req.route.api.patch(req)
      assert.equal(req.success, true)
    })
  })
})
