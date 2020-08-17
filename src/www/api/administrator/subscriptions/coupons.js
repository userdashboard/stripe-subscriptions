const subscriptions = require('../../../../../index.js')

module.exports = {
  get: async (req) => {
    req.query = req.query || {}
    let couponids
    if (req.query.all) {
      couponids = await subscriptions.StorageList.listAll(`${req.appid}/coupons`)
    } else {
      const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : global.pageSize
      couponids = await subscriptions.StorageList.list(`${req.appid}/coupons`, offset, limit)
    }
    if (!couponids || !couponids.length) {
      return null
    }
    const items = []
    for (const couponid of couponids) {
      req.query.couponid = couponid
      const item = await global.api.administrator.subscriptions.Coupon.get(req)
      items.push(item)
    }
    return items
  }
}
