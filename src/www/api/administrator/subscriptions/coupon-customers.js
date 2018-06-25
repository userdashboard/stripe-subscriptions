const dashboard = require('@userappstore/dashboard')
const subs = require('../../../../../index.js')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.couponid) {
      throw new Error('invalid-couponid')
    }
    const offset = req.query && req.query.offset ? parseInt(req.query.offset, 10) : 0
    const itemids = await dashboard.RedisList.list(`customers:coupon:${req.query.couponid}`, offset)
    if (!itemids || !itemids.length) {
      return null
    }
    return subs.StripeData.loadMany(itemids, req.stripeKey)
  }
}
