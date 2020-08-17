const subscriptions = require('../../../../../index.js')
const stripeCache = require('../../../../stripe-cache.js')

module.exports = {
  patch: async (req) => {
    if (!req.query || !req.query.paymentmethodid) {
      throw new Error('invalid-paymentmethodid')
    }
    const paymentMethod = await global.api.user.subscriptions.PaymentMethod.get(req)
    if (!paymentMethod) {
      throw new Error('invalid-paymentmethodid')
    }
    if (!paymentMethod.customer) {
      throw new Error('invalid-paymentmethod')
    }
    req.query.customerid = paymentMethod.customer
    const customer = await global.api.user.subscriptions.Customer.get(req)
    if (customer.invoice_settings.default_payment_method === req.query.paymentmethodid) {
      throw new Error('invalid-paymentmethod')
    }
    const paymentMethodNow = await stripeCache.execute('paymentMethods', 'detach', req.query.paymentmethodid, req.stripeKey)
    await stripeCache.delete(req.query.paymentmethodid, req.stripeKey)
    try {
      await subscriptions.StorageList.remove(`${req.appid}/paymentMethods`, req.query.paymentmethodid)
    } catch (error) {
    }
    try {
      await subscriptions.StorageList.remove(`${req.appid}/account/paymentMethods/${req.account.accountid}`, req.query.paymentmethodid)
    } catch (error) {
    }
    try {
      await subscriptions.Storage.delete(`${req.appid}/map/accountid/paymentmethodid/${req.query.paymentmethodid}`)
    } catch (error) {
    }
    return paymentMethodNow
  }
}
