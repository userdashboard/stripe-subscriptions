const subscriptions = require('../../../../../index.js')
const stripeCache = require('../../../../stripe-cache.js')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.couponid) {
      throw new Error('invalid-couponid')
    }
    const exists = await subscriptions.StorageList.exists(`${req.appid}/coupons`, req.query.couponid)
    if (!exists) {
      throw new Error('invalid-couponid')
    }
    let coupon
    try {
      coupon = await stripeCache.retrieve(req.query.couponid, 'coupons', req.stripeKey)
    } catch (error) {
    }
    if (!coupon) {
      throw new Error('invalid-couponid')
    }
    if (!coupon.metadata.published || coupon.metadata.unpublished) {
      throw new Error('invalid-coupon')
    }
    return coupon
  }
}
