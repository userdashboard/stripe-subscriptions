const dashboard = require('@userappstore/dashboard')
const stripe = require('stripe')()

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.planid) {
      throw new Error('invalid-planid')
    }
    const offset = req.query && req.query.offset ? parseInt(req.query.offset, 10) : 0
    const subscriptionids = await dashboard.RedisList.list(`plan:subscriptions:${req.query.planid}`, offset)
    if (!subscriptionids || !subscriptionids.length) {
      return null
    }
    const subscriptions = []
    for (const subscriptionid of subscriptionids) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionid, req.stripeKey)
      subscriptions.push(subscription)
    }
    return subscriptions
  }
}
