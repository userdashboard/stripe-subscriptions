const subscriptions = require('../../../../../index.js')
const stripeCache = require('../../../../stripe-cache.js')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.setupintentid) {
      throw new Error('invalid-setupintentid')
    }
    const exists = await subscriptions.StorageList.exists(`${req.appid}/setupIntents`, req.query.setupintentid)
    if (!exists) {
      throw new Error('invalid-setupintentid')
    }
    let setupIntent
    try {
      setupIntent = await stripeCache.retrieve(req.query.setupintentid, 'setupIntents', req.stripeKey)
    } catch (error) {
    }
    if (!setupIntent) {
      throw new Error('invalid-setupintentid')
    }
    return setupIntent
  }
}
