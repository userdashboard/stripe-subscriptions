const dashboard = require('@userappstore/dashboard')
const stripe = require('stripe')()

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.customerid) {
      throw new Error('invalid-customerid')
    }
    const offset = req.query && req.query.offset ? parseInt(req.query.offset, 10) : 0
    const itemids = await dashboard.RedisList.list(`invoices`, offset)
    if (!itemids || !itemids.length) {
      return null
    }
    const items = []
    for (const invoiceid of itemids) {
      const invoice = await stripe.invoices.retrieve(invoiceid, req.stripeKey)
      items.push(invoice)
    }
    return items
  }
}
