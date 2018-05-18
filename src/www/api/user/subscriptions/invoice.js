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
      throw new Error('invalid-invoiceid')
    }
    if (invoice.customer !== req.customer.id) {
      throw new Error('invalid-account')
    }
    invoice.date = global.dashboard.Timestamp.date(invoice.date)
    return invoice
  }
}
