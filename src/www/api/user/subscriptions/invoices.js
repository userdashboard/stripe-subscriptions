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
    const itemids = await dashboard.RedisList.list(`customer:disputes:${req.query.customerid}`, offset)
    if (!itemids || !itemids.length) {
      return null
    }
    const items = []
    for (const disputeid of itemids) {
      const dispute = await stripe.disputes.retrieve(disputeid, req.stripeKey)
      items.push(dispute)
    }
    return items
  }
}
