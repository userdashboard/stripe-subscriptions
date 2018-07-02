const dashboard = require('@userappstore/dashboard')
const stripe = require('stripe')()

module.exports = {
  lock: true,
  before: async (req) => {
    if (!req.query || !req.query.subscriptionid) {
      throw new Error('invalid-subscriptionid')
    }
    if (!req.body || !req.body.couponid) {
      throw new Error('invalid-couponid')
    }
    const couponExists = await dashboard.RedisList.exists(`coupons`, req.query.disputeid)
    if (!couponExists) {
      throw new Error('invalid-couponid')
    }
    const subscriptionExists = await dashboard.RedisList.exists(`subscriptions`, req.query.subscriptionid)
    const ownSubscriptionExists = await dashboard.RedisList.exists(`customer:subscriptions:${req.customer.id}`)
    if (!ownSubscriptionExists) {
      if (subscriptionExists) {
        throw new Error('invalid-account')
      }
      throw new Error('invalid-subscriptionid')
    }
    let coupon
    try {
      coupon = await stripe.coupons.retrieve(req.query.couponid, req.stripeKey)
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
      coupon: req.query.couponid
    }
    try {
      const subscription = await stripe.subscriptions.update(req.query.customerid, subscriptionInfo, req.stripeKey)
      req.success = true
      return subscription
    } catch (error) {
      throw new Error('unknown-error')
    }
  }
}
