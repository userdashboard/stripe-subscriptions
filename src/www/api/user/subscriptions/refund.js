const subscriptions = require('../../../../../index.js')
const stripeCache = require('../../../../stripe-cache.js')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.refundid) {
      throw new Error('invalid-refundid')
    }
    const exists = await subscriptions.StorageList.exists(`${req.appid}/refunds`, req.query.refundid)
    if (!exists) {
      throw new Error('invalid-refundid')
    }
    const owned = await subscriptions.StorageList.exists(`${req.appid}/account/refunds/${req.account.accountid}`, req.query.refundid)
    if (!owned) {
      throw new Error('invalid-account')
    }
    const refund = await stripeCache.retrieve(req.query.refundid, 'refunds', req.stripeKey)
    if (!refund) {
      throw new Error('invalid-refundid')
    }
    return refund
  }
}
