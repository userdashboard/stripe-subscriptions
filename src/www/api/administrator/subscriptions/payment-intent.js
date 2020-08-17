const subscriptions = require('../../../../../index.js')
const stripeCache = require('../../../../stripe-cache.js')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.paymentintentid) {
      throw new Error('invalid-paymentintentid')
    }
    const exists = await subscriptions.StorageList.exists(`${req.appid}/paymentIntents`, req.query.paymentintentid)
    if (!exists) {
      throw new Error('invalid-paymentintentid')
    }
    let invoice
    try {
      invoice = await stripeCache.retrieve(req.query.paymentintentid, 'paymentIntents', req.stripeKey)
    } catch (error) {
    }
    if (!invoice) {
      throw new Error('invalid-paymentintentid')
    }
    return invoice
  }
}
