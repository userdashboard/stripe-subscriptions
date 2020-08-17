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
    const owned = await subscriptions.StorageList.exists(`${req.appid}/account/paymentIntents/${req.account.accountid}`, req.query.paymentintentid)
    if (!owned) {
      throw new Error('invalid-account')
    }
    let paymentintent
    try {
      paymentintent = await stripeCache.retrieve(req.query.paymentintentid, 'paymentIntents', req.stripeKey)
    } catch (error) {
    }
    if (!paymentintent) {
      throw new Error('invalid-paymentintentid')
    }
    return paymentintent
  }
}
