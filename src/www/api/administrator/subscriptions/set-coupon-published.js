const dashboard = require('@userdashboard/dashboard')
const subscriptions = require('../../../../../index.js')
const stripeCache = require('../../../../stripe-cache.js')

module.exports = {
  patch: async (req) => {
    if (!req.query || !req.query.couponid) {
      throw new Error('invalid-couponid')
    }
    const coupon = await global.api.administrator.subscriptions.Coupon.get(req)
    if (!coupon) {
      throw new Error('invalid-couponid')
    }
    if (coupon.metadata.published || coupon.metadata.unpublished) {
      throw new Error('invalid-coupon')
    }
    const updateInfo = {
      metadata: {
        published: dashboard.Timestamp.now
      }
    }
    const couponNow = await stripeCache.execute('coupons', 'update', req.query.couponid, updateInfo, req.stripeKey)
    await stripeCache.update(couponNow)
    await subscriptions.StorageList.add(`${req.appid}/published/coupons`, req.query.couponid)
    return couponNow
  }
}
