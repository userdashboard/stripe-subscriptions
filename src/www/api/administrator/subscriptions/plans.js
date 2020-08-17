const subscriptions = require('../../../../../index.js')

module.exports = {
  get: async (req) => {
    req.query = req.query || {}
    let planids
    if (req.query.all) {
      planids = await subscriptions.StorageList.listAll(`${req.appid}/plans`)
    } else {
      const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : global.pageSize
      planids = await subscriptions.StorageList.list(`${req.appid}/plans`, offset, limit)
    }
    if (!planids || !planids.length) {
      return null
    }
    const items = []
    for (const planid of planids) {
      req.query.planid = planid
      const plan = await global.api.administrator.subscriptions.Plan.get(req)
      items.push(plan)
    }
    return items
  }
}
