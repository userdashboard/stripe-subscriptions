const dashboard = require('@userappstore/dashboard')
const stripe = require('stripe')()

module.exports = {
  get: async (req) => {
    let subscriptions
    if (req.query && req.query.customerid) {
      subscriptions = await stripe.subscriptions.list({customer: req.query.customerid}, req.stripeKey)
    } else {
      subscriptions = await stripe.subscriptions.list(req.stripeKey)
    }
    if (!subscriptions || !subscriptions.data || !subscriptions.data.length) {
      return null
    }
    for (const subscription of subscriptions.data) {
      subscription.created = dashboard.Timestamp.date(subscription.start)
    }
    return subscriptions.data
  }
}
