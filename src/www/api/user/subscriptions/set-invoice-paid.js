const dashboard = require('@userappstore/dashboard')
const stripe = require('stripe')()

module.exports = {
  lock: true,
  before: async (req) => {
    if (!req.query || !req.query.invoiceid) {
      throw new Error('invalid-invoiceid')
    }
    if (!req.body || !req.body.cardid) {
      throw new Error('invalid-cardid')
    }
    const invoiceExists = await dashboard.RedisList.exists(`invoices`, req.query.invoiceid)
    const ownInvoiceExists = invoiceExists ? await dashboard.RedisList.exists(`customer:invoices:${req.customer.id}`, req.query.invoiceid) : false
    if (!ownInvoiceExists) {
      if (invoiceExists) {
        throw new Error('invalid-account')
      }
      throw new Error('invalid-invoiceid')
    }
    const cardExists = await dashboard.RedisList.exists(`cards`, req.body.cardid)
    const ownCardExists = cardExists ? await dashboard.RedisList.exists(`customer:cards:${req.customer.id}`, req.body.cardid) : false
    if (!ownCardExists) {
      if (cardExists) {
        throw new Error('invalid-account')
      }
      throw new Error('invalid-cardid')
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
      const invoice = await stripe.invoices.pay(req.query.invoiceid, {source: req.body.sourceid}, req.stripeKey)
      req.success = true
      return invoice
    } catch (error) {
      if (error.message.indexOf(`Customer ${req.customer.id} does not have a linked source`) === 0) {
        throw new Error('invalid-cardid')
      }
      throw new Error('unknown-error')
    }
  }
}
