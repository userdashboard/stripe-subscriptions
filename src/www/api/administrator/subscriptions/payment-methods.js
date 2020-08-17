const subscriptions = require('../../../../../index.js')

module.exports = {
  get: async (req) => {
    req.query = req.query || {}
    let paymentmethodids
    if (req.query.all) {
      paymentmethodids = await subscriptions.StorageList.listAll(`${req.appid}/paymentMethods`)
    } else {
      const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : global.pageSize
      paymentmethodids = await subscriptions.StorageList.list(`${req.appid}/paymentMethods`, offset, limit)
    }
    if (!paymentmethodids || !paymentmethodids.length) {
      return null
    }
    const items = []
    for (const paymentmethodid of paymentmethodids) {
      req.query.paymentmethodid = paymentmethodid
      const paymentMethod = await global.api.administrator.subscriptions.PaymentMethod.get(req)
      items.push(paymentMethod)
    }
    return items
  }
}
