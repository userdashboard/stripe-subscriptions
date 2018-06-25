const dashboard = require('@userappstore/dashboard')
const subs = require('../../../../../index.js')

module.exports = {
  get: async (req) => {
    const itemids = await dashboard.RedisList.count(`published:products`)
    if (!itemids || !itemids.length) {
      return null
    }
    return subs.StripeData.loadMany(itemids, req.stripeKey)
  }
}
