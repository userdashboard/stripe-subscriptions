const dashboard = require('@userdashboard/dashboard')
const stripeCache = require('../../../../stripe-cache.js')

module.exports = {
  post: async (req) => {
    if (!req.query || !req.query.subscriptionid) {
      throw new Error('invalid-subscriptionid')
    }
    const subscription = await global.api.user.subscriptions.Subscription.get(req)
    if (!subscription) {
      throw new Error('invalid-subscriptionid')
    }
    if (subscription.plan.usage_type !== 'metered') {
      throw new Error('invalid-subscription')
    }
    try {
      const quantity = parseInt(req.body.quantity, 10)
      if (req.body.quantity !== quantity.toString()) {
        throw new Error('invalid-quantity')
      }
    } catch (s) {
      throw new Error('invalid-quantity')
    }
    if (req.body.quantity < 0) {
      throw new Error('invalid-quantity')
    }
    if (!req.body.action || (req.body.action !== 'increment' && req.body.action !== 'set')) {
      throw new Error('invalid-action')
    }
    if (!req.body.subscriptionitemid || !req.body.subscriptionitemid.length) {
      throw new Error('invalid-subscriptionitemid')
    }
    let found = false
    for (const item of subscription.items.data) {
      found = item.id === req.body.subscriptionitemid
      if (found) {
        break
      }
    }
    if (!found) {
      throw new Error('invalid-subscriptionitemid')
    }
    const usageInfo = {
      action: req.body.action,
      quantity: req.body.quantity
    }
    if (dashboard.Timestamp.now >= subscription.current_period_start) {
      usageInfo.timestamp = dashboard.Timestamp.now
    } else {
      usageInfo.timestamp = subscription.current_period_start
    }
    const usageRecord = await stripeCache.execute('subscriptionItems', 'createUsageRecord', req.body.subscriptionitemid, usageInfo, req.stripeKey)
    await stripeCache.update(usageRecord)
    return usageRecord
  }
}
