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
    if (coupon.metadata.unpublished) {
      throw new Error('invalid-coupon')
    }
    if (!req.body.name || !req.body.name.length) {
      throw new Error('invalid-name')
    }
    const updateInfo = {
      name: req.body.name
    }
    const couponNow = await stripeCache.execute('coupons', 'update', req.query.couponid, updateInfo, req.stripeKey)
    await stripeCache.update(couponNow)
    return couponNow
  }
}
