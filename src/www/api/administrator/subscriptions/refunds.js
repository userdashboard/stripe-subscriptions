const subscriptions = require('../../../../../index.js')

module.exports = {
  get: async (req) => {
    req.query = req.query || {}
    let refundids
    if (req.query.all) {
      refundids = await subscriptions.StorageList.listAll(`${req.appid}/refunds`)
    } else {
      const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : global.pageSize
      refundids = await subscriptions.StorageList.list(`${req.appid}/refunds`, offset, limit)
    }
    if (!refundids || !refundids.length) {
      return null
    }
    const items = []
    for (const refundid of refundids) {
      req.query.refundid = refundid
      const refund = await global.api.administrator.subscriptions.Refund.get(req)
      items.push(refund)
    }
    return items
  }
}
