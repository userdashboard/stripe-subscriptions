const subscriptions = require('../../../../../index.js')
const stripeCache = require('../../../../stripe-cache.js')

module.exports = {
  delete: async (req) => {
    if (!req.query || !req.query.customerid) {
      throw new Error('invalid-customerid')
    }
    const customer = await global.api.user.subscriptions.Customer.get(req)
    if (!customer) {
      throw new Error('invalid-customerid')
    }
    await stripeCache.execute('customers', 'del', req.query.customerid, req.stripeKey)
    await stripeCache.delete(req.query.customerid, req.stripeKey)
    await subscriptions.StorageList.remove(`${req.appid}/customers`, req.query.customerid)
    await subscriptions.StorageList.remove(`${req.appid}/account/customers/${req.account.accountid}`, req.query.customerid)
    await subscriptions.Storage.delete(`${req.appid}/map/accountid/customerid/${req.query.customerid}`)
    return true
  }
}
