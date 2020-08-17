const subscriptions = require('../../../../../index.js')
const stripeCache = require('../../../../stripe-cache.js')

module.exports = {
  patch: async (req) => {
    if (!req.query || !req.query.subscriptionid) {
      throw new Error('invalid-subscriptionid')
    }
    const subscriptionExists = await subscriptions.StorageList.exists(`${req.appid}/subscriptions`, req.query.subscriptionid)
    if (!subscriptionExists) {
      throw new Error('invalid-subscriptionid')
    }
    if (!req.body || !req.body.couponid) {
      throw new Error('invalid-couponid')
    }
    const couponExists = await subscriptions.StorageList.exists(`${req.appid}/coupons`, req.body.couponid)
    if (!couponExists) {
      throw new Error('invalid-couponid')
    }
    const subscription = await global.api.administrator.subscriptions.Subscription.get(req)
    if (!subscription) {
      throw new Error('invalid-subscriptionid')
    }
    if (subscription.discount && subscription.discount.coupon && subscription.discount.coupon.id) {
      throw new Error('invalid-subscription')
    }
    if ((subscription.status !== 'active' && subscription.status !== 'trialing') || subscription.cancel_at_period_end) {
      throw new Error('invalid-subscription')
    }
    req.query.couponid = req.body.couponid
    const coupon = await global.api.administrator.subscriptions.Coupon.get(req)
    if (!coupon) {
      throw new Error('invalid-couponid')
    }
    if (!coupon.metadata.published || coupon.metadata.unpublished) {
      throw new Error('invalid-coupon')
    }
    const subscriptionInfo = {
      coupon: req.body.couponid
    }
    const subscriptionNow = await stripeCache.execute('subscriptions', 'update', req.query.subscriptionid, subscriptionInfo, req.stripeKey)
    await stripeCache.update(subscriptionNow)
    await subscriptions.StorageList.addMany({
      [`${req.appid}/subscription/coupons/${req.query.subscriptionid}`]: req.body.couponid,
      [`${req.appid}/coupon/subscriptions/${req.body.couponid}`]: req.query.subscriptionid,
      [`${req.appid}/account/coupons/${subscription.metadata.accountid}`]: req.body.couponid,
      [`${req.appid}/coupon/accounts/${req.body.couponid}`]: subscription.metadata.accountid
    })
    return subscriptionNow
  }
}
