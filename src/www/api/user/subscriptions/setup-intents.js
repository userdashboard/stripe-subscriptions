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
    let setupintentids
    if (req.query.all) {
      setupintentids = await subscriptions.StorageList.listAll(`${req.appid}/account/setupIntents/${req.query.accountid}`)
    } else {
      const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : global.pageSize
      setupintentids = await subscriptions.StorageList.list(`${req.appid}/account/setupIntents/${req.query.accountid}`, offset, limit)
    }
    if (!setupintentids || !setupintentids.length) {
      return null
    }
    const items = []
    for (const setupintentid of setupintentids) {
      req.query.setupintentid = setupintentid
      const setupIntent = await global.api.user.subscriptions.SetupIntent.get(req)
      items.push(setupIntent)
    }
    return items
  }
}
