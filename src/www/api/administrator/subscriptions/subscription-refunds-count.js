const dashboard = require('@userappstore/dashboard')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.subscriptionid) {
      throw new Error('invalid-subscriptionid')
    }
    const count = await dashboard.RedisList.count(`refunds:subscription:${req.query.subscriptionid}`)
    return count
  }
}
