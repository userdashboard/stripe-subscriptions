const subscriptions = require('../../../../../index.js')

module.exports = {
  get: async (req) => {
    req.query = req.query || {}
    let paymentintentids
    if (req.query.all) {
      paymentintentids = await subscriptions.StorageList.listAll(`${req.appid}/paymentIntents`)
    } else {
      const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : global.pageSize
      paymentintentids = await subscriptions.StorageList.list(`${req.appid}/paymentIntents`, offset, limit)
    }
    if (!paymentintentids || !paymentintentids.length) {
      return null
    }
    const items = []
    for (const paymentintentid of paymentintentids) {
      req.query.paymentintentid = paymentintentid
      const paymentIntent = await global.api.administrator.subscriptions.PaymentIntent.get(req)
      items.push(paymentIntent)
    }
    return items
  }
}
