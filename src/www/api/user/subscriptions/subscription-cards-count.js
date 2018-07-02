const dashboard = require('@userappstore/dashboard')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.subscriptionid) {
      throw new Error('invalid-subscriptionid')
    }
    const total = await dashboard.RedisList.count(`subscription:cards:${req.query.subscriptionid}`, req.stripeKey)
    return total
  }
}
