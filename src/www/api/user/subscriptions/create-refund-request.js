const dashboard = require('@userdashboard/dashboard')
const subscriptions = require('../../../../../index.js')
const stripeCache = require('../../../../stripe-cache.js')

module.exports = {
  post: async (req) => {
    if (!req.query || !req.query.chargeid) {
      throw new Error('invalid-chargeid')
    }
    if (!req.body || !req.body.reason) {
      throw new Error('invalid-reason')
    }
    if (!req.body.reason.length || req.body.reason.length > 200) {
      throw new Error('invalid-reason-length')
    }
    const charge = await global.api.user.subscriptions.Charge.get(req)
    if (!charge.amount || !charge.paid || charge.refunded) {
      throw new Error('invalid-charge')
    }
    if (charge.metadata.refundRequested) {
      throw new Error('invalid-charge')
    }
    const chargeInfo = {
      metadata: {
        refundRequested: dashboard.Timestamp.now,
        refundReason: req.body.reason
      }
    }
    const chargeNow = await stripeCache.execute('charges', 'update', req.query.chargeid, chargeInfo, req.stripeKey)
    await subscriptions.StorageList.add(`${req.appid}/refundRequests`, charge.id)
    await stripeCache.update(chargeNow)
    return chargeNow
  }
}
