const stripe = require('stripe')()

module.exports = {
  lock: true,
  before: async (req) => {
    if (!req.query || !req.query.invoiceid) {
      throw new Error('invalid-invoiceid')
    }
    if (!req.body || !req.body.sourceid) {
      throw new Error('invalid-sourceid')
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
    if (invoice.forgiven || invoice.paid) {
      throw new Error('invalid-invoice')
    }
    if (!invoice.closed) {
      req.body.closed = true
    }
  },
  patch: async (req) => {
    try {
      await stripe.invoices.pay(req.query.invoiceid, {source: req.body.sourceid}, req.stripeKey)
      req.success = true
    } catch (error) {
      if (error.message.indexOf(`Customer ${req.customer.id} does not have a linked source`) === 0) {
        throw new Error('invalid-sourceid')
      }
      throw new Error('unknown-error')
    }
  }
}
