const subscriptions = require('../../../../../index.js')
const stripeCache = require('../../../../stripe-cache.js')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.subscriptionid) {
      throw new Error('invalid-subscriptionid')
    }
    const exists = await subscriptions.StorageList.exists(`${req.appid}/subscriptions`, req.query.subscriptionid)
    if (!exists) {
      throw new Error('invalid-subscriptionid')
    }
    const owned = await subscriptions.StorageList.exists(`${req.appid}/account/subscriptions/${req.account.accountid}`, req.query.subscriptionid)
    if (!owned) {
      throw new Error('invalid-account')
    }
    let subscription
    try {
      subscription = await stripeCache.retrieve(req.query.subscriptionid, 'subscriptions', req.stripeKey)
    } catch (error) {
    }
    if (!subscription) {
      throw new Error('invalid-subscriptionid')
    }
    return subscription
  }
}
