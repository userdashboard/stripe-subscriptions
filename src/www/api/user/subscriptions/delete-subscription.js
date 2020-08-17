const dashboard = require('@userdashboard/dashboard')
const stripeCache = require('../../../../stripe-cache.js')

module.exports = {
  delete: async (req) => {
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
    const deleteOptions = {
      prorate: false
    }
    const subscriptionNow = await stripeCache.execute('subscriptions', 'del', req.query.subscriptionid, deleteOptions, req.stripeKey)
    subscriptionNow.deleted = dashboard.Timestamp.now
    await stripeCache.update(subscriptionNow)
    return true
  }
}
