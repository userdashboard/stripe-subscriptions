const stripe = require('stripe')()

module.exports = {
  lock: true,
  before: async (req) => {
    if (!req.query || !req.query.subscriptionid) {
      throw new Error('invalid-subscriptionid')
    }
    let subscription
    try {
      subscription = await stripe.subscriptions.retrieve(req.query.subscriptionid, req.stripeKey)
    } catch (error) {
    }
    if (!subscription) {
      throw new Error('invalid-subscriptionid')
    }
    if (subscription.status !== 'active' || subscription.cancel_at_period_end) {
      throw new Error('invalid-subscription')
    }
    req.body = req.body || {}
  },
  delete: async (req) => {
    const deleteOptions = {
      at_period_end: req.body.refund === 'at_period_end'
    }
    try {
      const subscription = await stripe.subscriptions.del(req.query.subscriptionid, deleteOptions, req.stripeKey)
      req.success = true
      return subscription
    } catch (error) {
      throw new Error('unknown-error')
    }
  }
}
