const stripeCache = require('../../../../stripe-cache.js')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.subscriptionid) {
      throw new Error('invalid-subscriptionid')
    }
    const subscription = await global.api.user.subscriptions.Subscription.get(req)
    const invoice = await stripeCache.execute('invoices', 'retrieveUpcoming', {
      customer: subscription.customer.id || subscription.customer,
      subscription: req.query.subscriptionid
    }, req.stripeKey)
    if (!invoice) {
      throw new Error('invalid-subscriptionid')
    }
    return invoice
  }
}
