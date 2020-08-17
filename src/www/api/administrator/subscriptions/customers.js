const subscriptions = require('../../../../../index.js')

module.exports = {
  get: async (req) => {
    req.query = req.query || {}
    let customerids
    if (req.query.all) {
      customerids = await subscriptions.StorageList.listAll(`${req.appid}/customers`)
    } else {
      const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : global.pageSize
      customerids = await subscriptions.StorageList.list(`${req.appid}/customers`, offset, limit)
    }
    if (!customerids || !customerids.length) {
      return null
    }
    const items = []
    for (const customerid of customerids) {
      req.query.customerid = customerid
      const item = await global.api.administrator.subscriptions.Customer.get(req)
      items.push(item)
    }
    return items
  }
}
