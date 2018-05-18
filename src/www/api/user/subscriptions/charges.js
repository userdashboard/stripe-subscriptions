const stripe = require('stripe')()

module.exports = {
  get: async (req) => {
    const filter = {
      customer: req.customer.id
    }
    const charges = await stripe.charges.list(filter, req.stripeKey)
    if (!charges || !charges.data || !charges.data.length) {
      return null
    }
    for (const charge of charges.data) {
      charge.date = global.dashboard.Timestamp.date(charge.created)
    }
    return charges.data
  }
}
