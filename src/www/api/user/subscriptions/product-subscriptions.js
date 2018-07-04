const dashboard = require('@userappstore/dashboard')
const stripe = require('stripe')()

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.productid) {
      throw new Error('invalid-productid')
    }
    const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0
    const subscriptionids = await dashboard.RedisList.list(`product:subscriptions:${req.query.productid}`, offset)
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
