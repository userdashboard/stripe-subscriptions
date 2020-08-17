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
    let paymentintentids
    if (req.query.all) {
      paymentintentids = await subscriptions.StorageList.listAll(`${req.appid}/account/paymentIntentsPendingConfirmation/${req.query.accountid}`)
    } else {
      const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : global.pageSize
      paymentintentids = await subscriptions.StorageList.list(`${req.appid}/account/paymentIntentsPendingConfirmation/${req.query.accountid}`, offset, limit)
    }
    if (!paymentintentids || !paymentintentids.length) {
      return null
    }
    const items = []
    for (const paymentintentid of paymentintentids) {
      req.query.paymentintentid = paymentintentid
      const paymentIntent = await global.api.user.subscriptions.PaymentIntent.get(req)
      items.push(paymentIntent)
    }
    return items
  }
}
