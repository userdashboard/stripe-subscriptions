const stripe = require('stripe')()

module.exports = {
  lock: true,
  before: async (req) => {
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
    if (invoice.forgiven || invoice.paid) {
      throw new Error('invalid-invoice')
    }
    if (!invoice.closed) {
      req.body = req.body || {}
      req.body.closed = true
    }
  },
  patch: async (req) => {
    const updateInfo = {
      forgiven: true
    }
    if (req.body.closed) {
      updateInfo.closed = true
    }
    try {
      await stripe.invoices.update(req.query.invoiceid, updateInfo, req.stripeKey)
      req.success = true
    } catch (error) {
      throw new Error('unknown-error')
    }
  }
}
