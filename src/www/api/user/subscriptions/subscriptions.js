const subscriptions = require('../../../../../index.js')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.accountid) {
      throw new Error('invalid-accountid')
    }
    const account = await global.api.user.Account.get(req)
    if (!account) {
      throw new Error('invalid-account')
    }
    let index
    if (req.query.customerid) {
      const customer = await global.api.user.subscriptions.Customer.get(req)
      if (!customer) {
        throw new Error('invalid-customerid')
      }
      index = `${req.appid}/customer/subscriptions/${req.query.customerid}`
    } else {
      index = `${req.appid}/account/subscriptions/${req.query.accountid}`
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
      const subscription = await global.api.user.subscriptions.Subscription.get(req)
      items.push(subscription)
    }
    return items
  }
}
