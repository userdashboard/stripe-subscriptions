const dashboard = require('@userappstore/dashboard')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.subscriptionid) {
      throw new Error('invalid-subscriptionid')
    }
    return dashboard.RedisList.count(`subscription:refunds:${req.query.subscriptionid}`)
  }
}
