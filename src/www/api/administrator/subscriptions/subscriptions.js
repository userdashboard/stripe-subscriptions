const subscriptions = require('../../../../../index.js')

module.exports = {
  get: async (req) => {
    req.query = req.query || {}
    let index
    if (req.query.customerid) {
      index = `${req.appid}/customer/subscriptions/${req.query.customerid}`
    } else if (req.query.accountid) {
      index = `${req.appid}/account/subscriptions/${req.query.accountid}`
    } else {
      index = `${req.appid}/subscriptions`
    }
    let subscriptionids
    if (req.query.all) {
      subscriptionids = await subscriptions.StorageList.listAll(index)
    } else {
      const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : global.pageSize
      subscriptionids = await subscriptions.StorageList.list(index, offset, limit)
    }
    if (!subscriptionids || !subscriptionids.length) {
      return null
    }
    const items = []
    for (const subscriptionid of subscriptionids) {
      req.query.subscriptionid = subscriptionid
      const subscription = await global.api.administrator.subscriptions.Subscription.get(req)
      items.push(subscription)
    }
    return items
  }
}
