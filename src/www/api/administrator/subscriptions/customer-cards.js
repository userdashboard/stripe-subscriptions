const dashboard = require('@userappstore/dashboard')
const subs = require('../../../../../index.js')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.customerid) {
      throw new Error('invalid-customerid')
    }
    const offset = req.query && req.query.offset ? parseInt(req.query.offset, 10) : 0
    const itemids = await dashboard.RedisList.list(`customer:cards:${req.query.customerid}`, offset)
    if (!itemids || !itemids.length) {
      return null
    }
    return subs.StripeObject.loadMany(itemids, req.stripeKey)
  }
}
