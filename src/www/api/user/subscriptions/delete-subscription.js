const dashboard = require('@userappstore/dashboard')
const stripe = require('stripe')()

module.exports = {
  lock: true,
  before: async (req) => {
    if (!req.query || !req.query.subscriptionid) {
      throw new Error('invalid-subscriptionid')
    }
    const exists = await dashboard.RedisList.exists(`subscriptions`, req.query.subscriptionid)
    if (!exists) {
      throw new Error('invalid-subscriptionid')
    }
    const owned = await dashboard.RedisList.exists(`customer:subscriptions:${req.customer.id}`, req.query.subscriptionid)
    if (!owned) {
      throw new Error('invalid-account')
    }
    let subscription
    try {
      subscription = await global.api.user.subscriptions.Subscription.get(req)
    } catch (error) {
    }
    if (!subscription) {
      throw new Error('invalid-subscriptionid')
    }
    if (subscription.customer !== req.customer.id) {
      throw new Error('invalid-account')
    }
    if (subscription.status === 'deleted' || subscription.cancel_at_period_end) {
      throw new Error('invalid-subscription')
    }
    req.query.planid = subscription.plan
    req.subscription = subscription
    req.body = req.body || {}
  },
  delete: async (req) => {
    const deleteOptions = {
      at_period_end: req.body.refund === 'at_period_end'
    }
    try {
      const subscription = await stripe.subscriptions.del(req.query.subscriptionid, deleteOptions, req.stripeKey)
      await dashboard.RedisList.remove(`subscriptions`, req.subscription.id)
      await dashboard.RedisList.remove(`customer:subscriptions:${req.customer.id}`, req.subscription.id)
      await dashboard.RedisList.remove(`plan:subscriptions:${req.subscription.plan.id}`, req.subscription.id)
      await dashboard.RedisList.remove(`product:subscriptions:${req.subscription.plan.product}`, req.subscription.id)
      req.success = true
      return subscription
    } catch (error) {
      throw new Error('unknown-error')
    }
  }
}
