const stripe = require('stripe')()

module.exports = {
  get: async (req) => {
    const subscriptions = await stripe.subscriptions.list({customer: req.customer.id}, req.stripeKey)
    if (!subscriptions || !subscriptions.data || !subscriptions.data.length) {
      return null
    }
    for (const subscription of subscriptions.data) {
      subscription.created = global.dashboard.Timestamp.date(subscription.start)
    }
    return subscriptions.data
  }
}
