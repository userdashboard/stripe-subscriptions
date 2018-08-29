const dashboard = require('@userappstore/dashboard')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.subscriptionid) {
      throw new Error('invalid-subscriptionid')
    }
    return dashboard.RedisList.count(`${req.appid}:subscription:invoices:${req.query.subscriptionid}`)
  }
}
