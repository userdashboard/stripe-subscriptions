const dashboard = require('@userdashboard/dashboard')
const stripeCache = require('../../../../stripe-cache.js')

module.exports = {
  delete: async (req) => {
    if (!req.query || !req.query.subscriptionid) {
      throw new Error('invalid-subscriptionid')
    }
    let subscription = await global.api.administrator.subscriptions.Subscription.get(req)
    if (!subscription) {
      throw new Error('invalid-subscriptionid')
    }
    if ((subscription.status !== 'active' && subscription.status !== 'trialing') || subscription.cancel_at_period_end) {
      throw new Error('invalid-subscription')
    }
    if (!subscription.plan.amount) {
      subscription = await stripeCache.execute('subscriptions', 'del', req.query.subscriptionid, req.stripeKey)
      subscription.deleted = dashboard.Timestamp.now
      await stripeCache.update(subscription)
      return subscription
    }
    req.query.invoiceid = subscription.latest_invoice
    const invoice = await global.api.administrator.subscriptions.Invoice.get(req)
    if (!invoice.amount_paid) {
      subscription = await stripeCache.execute('subscriptions', 'del', req.query.subscriptionid, req.stripeKey)
      subscription.deleted = dashboard.Timestamp.now
      await stripeCache.update(subscription)
      return subscription
    }
    const deleteOptions = {
      prorate: true
    }
    subscription = await stripeCache.execute('subscriptions', 'del', req.query.subscriptionid, deleteOptions, req.stripeKey)
    subscription.deleted = dashboard.Timestamp.now
    await stripeCache.update(subscription)
    return true
  }
}
