const dashboard = require('@userappstore/dashboard')
const stripe = require('stripe')()

module.exports = {
  lock: true,
  before: async (req) => {
    if (!req.query || !req.query.couponid) {
      throw new Error('invalid-couponid')
    }
    let coupon
    try {
      coupon = await stripe.coupons.retrieve(req.query.couponid, req.stripeKey)
    } catch (error) {
    }
    if (!coupon) {
      throw new Error('invalid-couponid')
    }
    if (coupon.metadata.published || coupon.metadata.unpublished) {
      throw new Error('invalid-coupon')
    }
  },
  patch: async (req) => {
    const updateInfo = {
      metadata: {
        published: dashboard.Timestamp.now
      }
    }
    try {
      const coupon = await stripe.coupons.update(req.query.couponid, updateInfo, req.stripeKey)
      await dashboard.RedisList.add(`${req.appid}:published:coupons`, req.query.couponid)
      req.success = true
      return coupon
    } catch (error) {
      throw new Error('unknown-error')
    }
  }
}
