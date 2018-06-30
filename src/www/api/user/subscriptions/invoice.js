const dashboard = require('@userappstore/dashboard')
const stripe = require('stripe')()

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.invoiceid) {
      throw new Error('invalid-invoiceid')
    }
    let invoice
    try {
      invoice = await stripe.invoices.retrieve(req.query.invoiceid, req.stripeKey)
    } catch (error) {
    }
    if (!invoice) {
      const exists = await dashboard.RedisList.exists(`invoices`, req.query.invoiceid)
      if (exists) {
        throw new Error('invalid-account')
      }
      throw new Error('invalid-invoiceid')
    }
    if (invoice.customer !== req.customer.id) {
      throw new Error('invalid-account')
    }
    invoice.date = dashboard.Timestamp.date(invoice.date)
    return invoice
  }
}
