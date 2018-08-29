const dashboard = require('@userappstore/dashboard')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.subscriptionid) {
      throw new Error('invalid-subscriptionid')
    }
    const exists = await dashboard.RedisList.exists(`${req.appid}:subscriptions`, req.query.subscriptionid)
    if (!exists) {
      throw new Error('invalid-subscriptionid')
    }
    const owned = await dashboard.RedisList.exists(`${req.appid}:customer:subscriptions:${req.customer.id}`, req.query.subscriptionid)
    if (!owned) {
      throw new Error('invalid-account')
    }
    return dashboard.RedisList.count(`${req.appid}:subscription:charges:${req.query.subscriptionid}`)
  }
}
