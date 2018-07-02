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

    const offset = req.query && req.query.offset ? parseInt(req.query.offset, 10) : 0
    const itemids = await dashboard.RedisList.list(`customer:subscriptions:${req.query.customerid}`, offset)
    const disputes = []
    for (const subscriptionid of itemids) {
      const dispute = await stripe.disputes.retrieveUpcoming(req.query.customerid, subscriptionid, req.stripeKey)
      disputes.push(dispute)
    }
    if (!disputes.length) {
      return null
    }
    return disputes
  }
}
