const stripeCache = require('../../../../stripe-cache.js')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.couponid) {
      throw new Error('invalid-couponid')
    }
    const coupon = await stripeCache.retrieve(req.query.couponid, 'coupons', req.stripeKey)
    if (!coupon) {
      throw new Error('invalid-couponid')
    }
    return coupon
  }
}
