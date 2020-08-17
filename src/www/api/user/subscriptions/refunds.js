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
      index = `${req.appid}/customer/refunds/${req.query.customerid}`
    } else if (req.query.subscriptionid) {
      const subscription = await global.api.user.subscriptions.Subscription.get(req)
      if (!subscription) {
        throw new Error('invalid-subscriptionid')
      }
      index = `${req.appid}/subscription/refunds/${req.query.subscriptionid}`
    } else {
      index = `${req.appid}/account/refunds/${req.query.accountid}`
    }
    let refundids
    if (req.query.all) {
      refundids = await subscriptions.StorageList.listAll(index)
    } else {
      const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : global.pageSize
      refundids = await subscriptions.StorageList.list(index, offset, limit)
    }
    if (!refundids || !refundids.length) {
      return null
    }
    const items = []
    for (const refundid of refundids) {
      req.query.refundid = refundid
      const item = await global.api.user.subscriptions.Refund.get(req)
      items.push(item)
    }
    return items
  }
}
