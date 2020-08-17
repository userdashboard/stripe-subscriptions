const subscriptions = require('../../../../../index.js')
const stripeCache = require('../../../../stripe-cache.js')

module.exports = {
  post: async (req) => {
    if (!req.query || !req.query.customerid) {
      throw new Error('invalid-customerid')
    }
    const customer = await global.api.user.subscriptions.Customer.get(req)
    if (!customer) {
      throw new Error('invalid-customerid')
    }
    if (!req.body || !req.body.paymentmethodid) {
      throw new Error('invalid-paymentmethodid')
    }
    req.query.paymentmethodid = req.body.paymentmethodid
    const paymentMethod = await global.api.user.subscriptions.PaymentMethod.get(req)
    if (!paymentMethod) {
      throw new Error('invalid-paymentmethodid')
    }
    const setupIntent = await stripeCache.execute('setupIntents', 'create', {
      payment_method_types: ['card'],
      customer: req.query.customerid,
      payment_method: req.body.paymentmethodid
    }, req.stripeKey)
    await stripeCache.update(setupIntent)
    await subscriptions.StorageList.addMany({
      [`${req.appid}/setupIntents`]: setupIntent.id,
      [`${req.appid}/customer/setupIntents/${req.query.customerid}`]: setupIntent.id,
      [`${req.appid}/account/setupIntents/${req.account.accountid}`]: setupIntent.id
    })
    return setupIntent
  }
}
