const dashboard = require('@userappstore/dashboard')
const stripe = require('stripe')()

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.customerid) {
      throw new Error('invalid-customerid')
    }
    if (req.customer.id !== req.query.customerid) {
      throw new Error('invalid-customer')
    }
    const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0
    const itemids = await dashboard.RedisList.list(`customer:subscriptions:${req.query.customerid}`, offset)
    const invoices = []
    for (const subscriptionid of itemids) {
      const invoice = await stripe.invoices.retrieveUpcoming(req.query.customerid, subscriptionid, req.stripeKey)
      invoices.push(invoice)
    }
    if (!invoices.length) {
      return null
    }
    return invoices
  }
}
