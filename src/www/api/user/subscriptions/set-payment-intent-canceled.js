const subscriptions = require('../../../../../index.js')
const stripeCache = require('../../../../stripe-cache.js')

module.exports = {
  patch: async (req) => {
    if (!req.query || !req.query.paymentintentid) {
      throw new Error('invalid-paymentintentid')
    }
    const paymentIntent = await global.api.user.subscriptions.PaymentIntent.get(req)
    if (!paymentIntent) {
      throw new Error('invalid-paymentintentid')
    }
    req.query.customerid = paymentIntent.customer
    const customer = await global.api.user.subscriptions.Customer.get(req)
    if (!customer) {
      throw new Error('invalid-paymentintentid')
    }
    const paymentIntentNow = await stripeCache.execute('paymentIntents', 'cancel', req.query.paymentintentid, req.stripeKey)
    await stripeCache.delete(req.query.paymentintentid, req.stripeKey)
    try {
      await subscriptions.StorageList.remove(`${req.appid}/paymentIntents`, req.query.paymentintentid)
    } catch (error) {
    }
    try {
      await subscriptions.StorageList.remove(`${req.appid}/account/paymentIntents/${req.account.accountid}`, req.query.paymentintentid)
    } catch (error) {
    }
    try {
      await subscriptions.Storage.delete(`${req.appid}/map/accountid/paymentintentid/${req.query.paymentintentid}`)
    } catch (error) {
    }
    return paymentIntentNow
  }
}
