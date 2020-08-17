const stripeCache = require('../../../../stripe-cache.js')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.subscriptionid) {
      throw new Error('invalid-subscriptionid')
    }
    let subscription
    try {
      subscription = await stripeCache.retrieve(req.query.subscriptionid, 'subscriptions', req.stripeKey)
    } catch (error) {
    }
    if (!subscription) {
      throw new Error('invalid-subscriptionid')
    }
    return subscription
  }
}
