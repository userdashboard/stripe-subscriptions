const stripe = require('stripe')()

module.exports = {
  get: async (req) => {
    const coupons = await stripe.coupons.list(req.stripeKey)
    if (!coupons || !coupons.data || !coupons.data.length) {
      return null
    }
    for (const coupon of coupons.data) {
      coupon.date = global.dashboard.Timestamp.date(coupon.created)
    }
    return coupons.data
  }
}
