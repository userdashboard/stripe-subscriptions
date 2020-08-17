const subscriptions = require('../../../../../index.js')
const stripeCache = require('../../../../stripe-cache.js')

module.exports = {
  delete: async (req) => {
    if (!req.query || !req.query.couponid) {
      throw new Error('invalid-couponid')
    }
    const coupon = await global.api.administrator.subscriptions.Coupon.get(req)
    if (!coupon) {
      throw new Error('invalid-couponid')
    }
    await stripeCache.execute('coupons', 'del', req.query.couponid, req.stripeKey)
    await subscriptions.StorageList.remove(`${req.appid}/coupons`, req.query.couponid)
    if (coupon.metadata.unpublished) {
      await subscriptions.StorageList.remove(`${req.appid}/unpublished/coupons`, req.query.couponid)
    } else if (coupon.metadata.published) {
      await subscriptions.StorageList.remove(`${req.appid}/published/coupons`, req.query.couponid)
    }
    await stripeCache.delete(req.query.couponid, req.stripeKey)
    return true
  }
}
