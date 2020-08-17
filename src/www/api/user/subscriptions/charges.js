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
    let chargeids
    if (req.query.all) {
      chargeids = await subscriptions.StorageList.listAll(`${req.appid}/account/charges/${req.query.accountid}`)
    } else {
      const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : global.pageSize
      chargeids = await subscriptions.StorageList.list(`${req.appid}/account/charges/${req.query.accountid}`, offset, limit)
    }
    if (!chargeids || !chargeids.length) {
      return null
    }
    const items = []
    for (const chargeid of chargeids) {
      req.query.chargeid = chargeid
      const item = await await global.api.user.subscriptions.Charge.get(req)
      items.push(item)
    }
    return items
  }
}
