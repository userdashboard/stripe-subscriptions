const subscriptions = require('../../../../../index.js')
const stripeCache = require('../../../../stripe-cache.js')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.chargeid) {
      throw new Error('invalid-chargeid')
    }
    const exists = await subscriptions.StorageList.exists(`${req.appid}/charges`, req.query.chargeid)
    if (!exists) {
      throw new Error('invalid-chargeid')
    }
    const owned = await subscriptions.StorageList.exists(`${req.appid}/account/charges/${req.account.accountid}`, req.query.chargeid)
    if (!owned) {
      throw new Error('invalid-account')
    }
    let charge
    try {
      charge = await stripeCache.retrieve(req.query.chargeid, 'charges', req.stripeKey)
    } catch (error) {
    }
    if (!charge) {
      throw new Error('invalid-chargeid')
    }
    return charge
  }
}
