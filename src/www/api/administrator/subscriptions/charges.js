const dashboard = require('@userappstore/dashboard')
const stripe = require('stripe')()

module.exports = {
  get: async (req) => {
    let charges
    if (req.query && req.query.customerid) {
      const filter = {
        customer: req.query.customerid
      }
      charges = await stripe.charges.list(filter, req.stripeKey)
    } else {
      charges = await stripe.charges.list(req.stripeKey)
    }
    if (!charges || !charges.data || !charges.data.length) {
      return null
    }
    for (const charge of charges.data) {
      charge.date = dashboard.Timestamp.date(charge.created)
    }
    return charges.data
  }
}
