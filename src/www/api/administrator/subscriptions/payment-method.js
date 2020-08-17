const subscriptions = require('../../../../../index.js')
const stripeCache = require('../../../../stripe-cache.js')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.paymentmethodid) {
      throw new Error('invalid-paymentmethodid')
    }
    const exists = await subscriptions.StorageList.exists(`${req.appid}/paymentMethods`, req.query.paymentmethodid)
    if (!exists) {
      throw new Error('invalid-paymentmethodid')
    }
    let paymentMethod
    try {
      paymentMethod = await stripeCache.retrieve(req.query.paymentmethodid, 'paymentMethods', req.stripeKey)
    } catch (error) {
    }
    if (!paymentMethod) {
      throw new Error('invalid-paymentmethodid')
    }
    return paymentMethod
  }
}
