const dashboard = require('@userappstore/dashboard')
const stripe = require('stripe')()

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.planid) {
      throw new Error('invalid-planid')
    }
    const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0
    const invoiceids = await dashboard.RedisList.list(`plan:invoices:${req.query.planid}`, offset)
    if (!invoiceids || !invoiceids.length) {
      return null
    }
    const invoices = []
    for (const invoiceid of invoiceids) {
      const invoice = await stripe.invoices.retrieve(invoiceid, req.stripeKey)
      invoices.push(invoice)
    }
    return invoices
  }
}
