const dashboard = require('@userappstore/dashboard')
const stripe = require('stripe')()

module.exports = {
  lock: true,
  before: async (req) => {
    if (!req.query || !req.query.subscriptionid) {
      throw new Error('invalid-subscriptionid')
    }
    const subscriptionExists = await dashboard.RedisList.exists(`subscriptions`, req.query.subscriptionid)
    if (!subscriptionExists) {
      throw new Error('invalid-subscriptionid')
    }
    if (!req.body || !req.body.couponid) {
      throw new Error('invalid-couponid')
    }
    const couponExists = await dashboard.RedisList.exists(`coupons`, req.body.couponid)
    if (!couponExists) {
      throw new Error('invalid-couponid')
    }
    let subscription
    try {
      subscription = await stripe.subscriptions.retrieve(req.query.subscriptionid, req.stripeKey)
    } catch (error) {
    }
    if (!subscription) {
      throw new Error('invalid-subscriptionid')
    }
    if (subscription.discount) {
      throw new Error('invalid-subscription')
    }
    let coupon
    try {
      coupon = await stripe.coupons.retrieve(req.body.couponid, req.stripeKey)
    } catch (error) {
    }
    if (!coupon) {
      throw new Error('invalid-couponid')
    }
    if (!coupon.metadata.published || coupon.metadata.unpublished) {
      throw new Error('invalid-coupon')
    }
  },
  patch: async (req) => {
    const subscriptionInfo = {
      coupon: req.body.couponid
    }
    try {
      const subscription = await stripe.subscriptions.update(req.query.subscriptionid, subscriptionInfo, req.stripeKey)
      req.success = true
      await dashboard.RedisList.add(`subscription:coupons:${req.query.subscriptionid}`, req.body.couponid)
      await dashboard.RedisList.add(`coupon:subscriptions:${req.body.couponid}`, req.query.subscriptionid)
      return subscription
    } catch (error) {
      throw new Error('unknown-error')
    }
  }
}
