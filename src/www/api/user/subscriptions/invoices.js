const dashboard = require('@userappstore/dashboard')
const stripe = require('stripe')()

module.exports = {
  get: async (req) => {
    const filter = {
      customer: req.customer.id
    }
    if (req.query && req.query.subscriptionid) {
      filter.subscription = req.query.subscriptionid
    }
    const invoices = await stripe.invoices.list(filter, req.stripeKey)
    if (!invoices || !invoices.data || !invoices.data.length) {
      return null
    }
    for (const invoice of invoices.data) {
      invoice.date = dashboard.Timestamp.date(invoice.date)
    }
    return invoices.data
  }
}
