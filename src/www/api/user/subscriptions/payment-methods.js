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
    let paymentmethodids
    if (req.query.all) {
      paymentmethodids = await subscriptions.StorageList.listAll(`${req.appid}/account/paymentMethods/${req.query.accountid}`)
    } else {
      const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : global.pageSize
      paymentmethodids = await subscriptions.StorageList.list(`${req.appid}/account/paymentMethods/${req.query.accountid}`, offset, limit)
    }
    if (!paymentmethodids || !paymentmethodids.length) {
      return null
    }
    const items = []
    for (const paymentmethodid of paymentmethodids) {
      req.query.paymentmethodid = paymentmethodid
      const paymentMethod = await global.api.user.subscriptions.PaymentMethod.get(req)
      items.push(paymentMethod)
    }
    return items
  }
}
