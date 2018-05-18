const stripe = require('stripe')()

module.exports = {
  get: async (req) => {
    const refunds = await stripe.refunds.list(req.stripeKey)
    if (refunds && refunds.data && refunds.data.length) {
      for (const refund of refunds.data) {
        refunds.created = global.dashboard.Timestamp.date(refund.created)
      }
    }
    return refunds.data
  }
}
