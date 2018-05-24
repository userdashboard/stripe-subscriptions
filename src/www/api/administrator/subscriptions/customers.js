const dashboard = require('@userappstore/dashboard')
const stripe = require('stripe')()

module.exports = {
  get: async (req) => {
    const customers = await stripe.customers.list(req.stripeKey)
    if (!customers || !customers.data || !customers.data.length) {
      return null
    }
    for (const customer of customers.data) {
      customer.date = dashboard.Timestamp.date(customer.created)
    }
    return customers.data
  }
}
