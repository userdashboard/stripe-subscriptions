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
    const invoices = []
    const subscriptionids = await dashboard.RedisList.lrange(`customer:subscriptions:${req.query.customerid}`)
    for (const subscriptionid of subscriptionids) {
      const invoice = await stripe.invoices.retrieveUpcoming(req.query.customerid, subscriptionid, req.stripeKey)
      invoices.push(invoice)
    }
    if (!invoices.length) {
      return null
    }
    return invoices
  }
}
