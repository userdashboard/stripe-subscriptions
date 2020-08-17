const subscriptions = require('../../../../../index.js')

module.exports = {
  auth: false,
  get: async (req) => {
    req.query = req.query || {}
    let planids
    if (req.query.all) {
      planids = await subscriptions.StorageList.listAll(`${req.appid}/published/plans`)
    } else {
      const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : global.pageSize
      planids = await subscriptions.StorageList.list(`${req.appid}/published/plans`, offset, limit)
    }
    if (!planids || !planids.length) {
      return null
    }
    const items = []
    for (const planid of planids) {
      req.query.planid = planid
      const item = await global.api.user.subscriptions.PublishedPlan.get(req)
      items.push(item)
    }
    return items
  }
}
