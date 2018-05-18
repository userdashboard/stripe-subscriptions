const stripe = require('stripe')()

module.exports = {
  get: async (req) => {
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
    coupon.date = global.dashboard.Timestamp.date(coupon.created)
    return coupon
  }
}
