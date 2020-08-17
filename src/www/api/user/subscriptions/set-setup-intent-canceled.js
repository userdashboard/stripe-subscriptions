const subscriptions = require('../../../../../index.js')
const stripeCache = require('../../../../stripe-cache.js')

module.exports = {
  patch: async (req) => {
    if (!req.query || !req.query.setupintentid) {
      throw new Error('invalid-setupintentid')
    }
    const setupIntent = await global.api.user.subscriptions.SetupIntent.get(req)
    if (!setupIntent) {
      throw new Error('invalid-setupintentid')
    }
    req.query.customerid = setupIntent.customer
    const customer = await global.api.user.subscriptions.Customer.get(req)
    if (!customer) {
      throw new Error('invalid-setupintentid')
    }
    try {
      await subscriptions.StorageList.remove(`${req.appid}/setupIntents`, req.query.setupintentid)
    } catch (error) {
    }
    try {
      await subscriptions.StorageList.remove(`${req.appid}/account/setupIntents/${req.account.accountid}`, req.query.setupintentid)
    } catch (error) {
    }
    try {
      await subscriptions.Storage.delete(`${req.appid}/map/accountid/setupintentid/${req.query.setupintentid}`)
    } catch (error) {
    }
    const setupIntentNow = await stripeCache.execute('setupIntents', 'cancel', req.query.setupintentid, req.stripeKey)
    await stripeCache.delete(req.query.setupintentid, req.stripeKey)
    return setupIntentNow
  }
}
