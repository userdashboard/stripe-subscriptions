const dashboard = require('@userappstore/dashboard')
const subs = require('../../../../../index.js')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.productid) {
      throw new Error('invalid-productid')
    }
    const offset = req.query && req.query.offset ? parseInt(req.query.offset, 10) : 0
    const itemids = await dashboard.RedisList.list(`invoices:product:${req.query.productid}`, offset)
    if (!itemids || !itemids.length) {
      return null
    }
    return subs.StripeData.loadMany(itemids, req.stripeKey)
  }
}
