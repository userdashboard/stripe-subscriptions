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
    let customerids
    if (req.query.all) {
      customerids = await subscriptions.StorageList.listAll(`${req.appid}/account/customers/${req.query.accountid}`)
    } else {
      const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : global.pageSize
      customerids = await subscriptions.StorageList.list(`${req.appid}/account/customers/${req.query.accountid}`, offset, limit)
    }
    if (!customerids || !customerids.length) {
      return null
    }
    const items = []
    for (const customerid of customerids) {
      req.query.customerid = customerid
      const customer = await global.api.user.subscriptions.Customer.get(req)
      items.push(customer)
    }
    return items
  }
}
