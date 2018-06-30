const dashboard = require('@userappstore/dashboard')
const stripe = require('stripe')()

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.productid) {
      throw new Error('invalid-productid')
    }
    const offset = req.query && req.query.offset ? parseInt(req.query.offset, 10) : 0
    const itemids = await dashboard.RedisList.list(`product:refunds:${req.query.productid}`, offset)
    if (!itemids || !itemids.length) {
      return null
    }
    const items = []
    for (const refundid of itemids) {
      const refund = await stripe.refunds.retrieve(refundid, req.stripeKey)
      items.push(refund)
    }
    return items
  }
}
