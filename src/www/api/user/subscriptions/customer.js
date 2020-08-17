const subscriptions = require('../../../../../index.js')
const stripeCache = require('../../../../stripe-cache.js')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.customerid) {
      throw new Error('invalid-customerid')
    }
    const exists = await subscriptions.StorageList.exists(`${req.appid}/customers`, req.query.customerid)
    if (!exists) {
      throw new Error('invalid-customerid')
    }
    const owned = await subscriptions.StorageList.exists(`${req.appid}/account/customers/${req.account.accountid}`, req.query.customerid)
    if (!owned) {
      throw new Error('invalid-account')
    }
    const customer = await stripeCache.retrieve(req.query.customerid, 'customers', req.stripeKey)
    if (!customer) {
      throw new Error('invalid-customerid')
    }
    if (customer.metadata.accountid !== req.account.accountid) {
      throw new Error('invalid-account')
    }
    return customer
  }
}
