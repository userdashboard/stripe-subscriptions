const subscriptions = require('../../../../../index.js')
const stripeCache = require('../../../../stripe-cache.js')

module.exports = {
  patch: async (req) => {
    if (!req.query || !req.query.subscriptionid) {
      throw new Error('invalid-subscriptionid')
    }
    const subscription = await global.api.user.subscriptions.Subscription.get(req)
    if (!subscription) {
      throw new Error('invalid-subscriptionid')
    }
    if ((subscription.status !== 'active' && subscription.status !== 'trialing') || subscription.cancel_at_period_end) {
      throw new Error('invalid-subscription')
    }
    if (!req.body || !req.body.couponid) {
      throw new Error('invalid-couponid')
    }
    if (!req.body || !req.body.couponid) {
      throw new Error('invalid-couponid')
    }
    const couponExists = await subscriptions.StorageList.exists(`${req.appid}/coupons`, req.body.couponid)
    if (!couponExists) {
      throw new Error('invalid-couponid')
    }
    if (subscription.discount) {
      throw new Error('invalid-subscription')
    }
    req.query.couponid = req.body.couponid
    const coupon = await global.api.user.subscriptions.PublishedCoupon.get(req)
    if (!coupon) {
      throw new Error('invalid-couponid')
    }
    const subscriptionInfo = {
      coupon: req.body.couponid
    }
    const subscriptionNow = await stripeCache.execute('subscriptions', 'update', req.query.subscriptionid, subscriptionInfo, req.stripeKey)
    await stripeCache.update(subscriptionNow)
    return subscriptionNow
  }
}
