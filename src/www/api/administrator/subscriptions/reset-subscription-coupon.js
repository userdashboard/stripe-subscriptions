const stripeCache = require('../../../../stripe-cache.js')

module.exports = {
  patch: async (req) => {
    if (!req.query || !req.query.subscriptionid) {
      throw new Error('invalid-subscriptionid')
    }
    const subscription = await global.api.administrator.subscriptions.Subscription.get(req)
    if (!subscription) {
      throw new Error('invalid-subscriptionid')
    }
    if (!subscription.discount) {
      throw new Error('invalid-subscription')
    }
    const updateInfo = {
      coupon: null
    }
    const subscriptionNow = await stripeCache.execute('subscriptions', 'update', req.query.subscriptionid, updateInfo, req.stripeKey)
    await stripeCache.update(subscriptionNow)
    return subscriptionNow
  }
}
