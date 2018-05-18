const stripe = require('stripe')()

module.exports = {
  lock: true,
  before: async (req) => {
    if (!req.query || !req.query.subscriptionid) {
      throw new Error('invalid-subscriptionid')
    }
    let subscription
    try {
      subscription = await stripe.subscriptions.retrieve(req.query.subscriptionid, req.stripeKey)
    } catch (error) {
    }
    if (!subscription) {
      throw new Error('invalid-subscriptionid')
    }
    if (!req.body || !req.body.couponid) {
      throw new Error('invalid-couponid')
    }
    let coupon
    try {
      coupon = await stripe.coupons.retrieve(req.body.couponid, req.stripeKey)
    } catch (error) {
    }
    if (!coupon) {
      throw new Error('invalid-couponid')
    }
    if (coupon.metadata.unpublished) {
      throw new Error('invalid-coupon')
    }
  },
  patch: async (req) => {
    const updateInfo = {
      coupon: req.body.couponid
    }
    try {
      await stripe.subscriptions.update(req.query.subscriptionid, updateInfo, req.stripeKey)
      req.success = true
      return
    } catch (error) {
      throw new Error('unknown-error')
    }
  }
}
