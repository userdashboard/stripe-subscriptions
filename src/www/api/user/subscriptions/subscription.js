const dashboard = require('@userappstore/dashboard')
const stripe = require('stripe')()

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.subscriptionid) {
      throw new Error('invalid-subscriptionid')
    }
    const exists = await dashboard.RedisList.exists(`${req.appid}:subscriptions`, req.query.subscriptionid)
    if (!exists) {
      throw new Error('invalid-subscriptionid')
    }
    const owned = await dashboard.RedisList.exists(`${req.appid}:customer:subscriptions:${req.customer.id}`, req.query.subscriptionid)
    if (!owned) {
      throw new Error('invalid-account')
    }
    let subscription
    try {
      subscription = await stripe.subscriptions.retrieve(req.query.subscriptionid, req.stripeKey)
    } catch (error) {
    }
    if (!subscription) {
      throw new Error('invalid-subscriptionid')
    }
    if (subscription.customer !== req.customer.id) {
      throw new Error('invalid-account')
    }
    subscription.created = dashboard.Timestamp.date(subscription.start)
    return subscription
  }
}
