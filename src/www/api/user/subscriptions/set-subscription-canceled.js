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
    const delayed = {
      cancel_at_period_end: true
    }
    const subscriptionNow = await stripeCache.execute('subscriptions', 'update', req.query.subscriptionid, delayed, req.stripeKey)
    if (!subscriptionNow) {
      throw new Error('unknown-error')
    }
    await stripeCache.delete(req.query.subscriptionid)
    return subscriptionNow
  }
}
