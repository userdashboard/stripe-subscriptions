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
    const invoiceExists = await dashboard.RedisList.exists(`${req.appid}:invoices`, req.query.invoiceid)
    if (!invoiceExists) {
      throw new Error('invalid-invoiceid')
    }
    const ownInvoiceExists = await dashboard.RedisList.exists(`${req.appid}:customer:invoices:${req.customer.id}`, req.query.invoiceid)
    if (!ownInvoiceExists) {
      throw new Error('invalid-account')
    }
    const cardExists = await dashboard.RedisList.exists(`${req.appid}:cards`, req.body.cardid)
    if (!cardExists) {
      throw new Error('invalid-cardid')
    }
    const ownCardExists = await dashboard.RedisList.exists(`${req.appid}:customer:cards:${req.customer.id}`, req.body.cardid)
    if (!ownCardExists) {
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
    if (invoice.customer !== req.customer.id) {
      throw new Error('invalid-account')
    }
    if (invoice.forgiven || invoice.paid) {
      throw new Error('invalid-invoice')
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
