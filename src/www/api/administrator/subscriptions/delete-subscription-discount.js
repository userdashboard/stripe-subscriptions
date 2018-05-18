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
    if (!subscription.discount) {
      throw new Error('invalid-subscription')
    }
  },
  delete: async (req) => {
    const updateInfo = {
      coupon: null
    }
    try {
      await stripe.subscriptions.update(req.query.subscriptionid, updateInfo, req.stripeKey)
      req.success = true
    } catch (error) {
      throw new Error('unknown-error')
    }
  }
}
