const dashboard = require('@userappstore/dashboard')
const stripe = require('stripe')()

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.invoiceid) {
      throw new Error('invalid-invoiceid')
    }
    const exists = await dashboard.RedisList.exists(`invoices`, req.query.invoiceid)
    if (!exists) {
      throw new Error('invalid-invoiceid')
    }
    const owned = await dashboard.RedisList.exists(`customer:invoices:${req.customer.id}`, req.query.invoiceid)
    if (!owned) {
      throw new Error('invalid-account')
    }
    let invoice
    try {
      invoice = await stripe.invoices.retrieve(req.query.invoiceid, req.stripeKey)
    } catch (error) {
    }
    if (!invoice) {
      throw new Error('invalid-invoiceid')
    }
    invoice.date = dashboard.Timestamp.date(invoice.date)
    return invoice
  }
}
