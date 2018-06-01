const stripe = require('stripe')()

module.exports = {
  get: async (req) => {
    const payouts = await stripe.payouts.list(req.stripeKey)
    if (!payouts.data || !payouts.data.length) {
      return null
    }
    return payouts.data
  }
}
