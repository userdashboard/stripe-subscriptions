const subscriptions = require('../../../../../index.js')

module.exports = {
  get: async (req) => {
    req.query = req.query || {}
    let setupintentids
    if (req.query.all) {
      setupintentids = await subscriptions.StorageList.listAll(`${req.appid}/setupIntents`)
    } else {
      const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : global.pageSize
      setupintentids = await subscriptions.StorageList.list(`${req.appid}/setupIntents`, offset, limit)
    }
    if (!setupintentids || !setupintentids.length) {
      return null
    }
    const items = []
    for (const setupintentid of setupintentids) {
      req.query.setupintentid = setupintentid
      const setupIntent = await global.api.administrator.subscriptions.SetupIntent.get(req)
      items.push(setupIntent)
    }
    return items
  }
}
