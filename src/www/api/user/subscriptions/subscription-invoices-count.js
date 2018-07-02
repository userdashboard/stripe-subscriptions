const dashboard = require('@userappstore/dashboard')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.subscriptionid) {
      throw new Error('invalid-subscriptionid')
    }
    const result = await dashboard.RedisList.count(`subscription:invoices:${req.query.subscriptionid}`)
    return result
  }
}
