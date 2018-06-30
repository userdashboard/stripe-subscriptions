const dashboard = require('@userappstore/dashboard')
const stripe = require('stripe')()

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.subscriptionid) {
      throw new Error('invalid-subscriptionid')
    }
    const offset = req.query && req.query.offset ? parseInt(req.query.offset, 10) : 0
    const itemids = await dashboard.RedisList.list(`subscription:invoices:${req.query.subscriptionid}`, offset)
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
