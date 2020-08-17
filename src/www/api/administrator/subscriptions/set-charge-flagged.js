const stripeCache = require('../../../../stripe-cache.js')

module.exports = {
  patch: async (req) => {
    if (!req.query || !req.query.chargeid) {
      throw new Error('invalid-chargeid')
    }
    const charge = await global.api.administrator.subscriptions.Charge.get(req)
    if (!charge) {
      throw new Error('invalid-chargeid')
    }
    if (charge.fraud_details.user_report) {
      throw new Error('invalid-charge')
    }
    const chargeInfo = {
      fraud_details: {
        user_report: 'fraudulent'
      }
    }
    const chargeNow = await stripeCache.execute('charges', 'update', req.query.chargeid, chargeInfo, req.stripeKey)
    await stripeCache.update(chargeNow)
    return chargeNow
  }
}
