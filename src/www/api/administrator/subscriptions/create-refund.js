const stripeCache = require('../../../../stripe-cache.js')

module.exports = {
  post: async (req) => {
    if (!req.query || !req.query.chargeid) {
      throw new Error('invalid-chargeid')
    }
    if (!req.body || !req.body.amount) {
      throw new Error('invalid-amount')
    }
    const charge = await global.api.administrator.subscriptions.Charge.get(req)
    if (!charge) {
      throw new Error('invalid-chargeid')
    }
    const balance = charge.amount - (charge.amount_refunded || 0)
    if (charge.refunded || !charge.paid || charge.amount === 0 || balance === 0) {
      throw new Error('invalid-charge')
    }
    try {
      req.body.amount = parseInt(req.body.amount, 10)
      if (!req.body.amount || req.body.amount < 0 || req.body.amount > balance) {
        throw new Error('invalid-amount')
      }
    } catch (error) {
      throw new Error('invalid-amount')
    }
    const refundInfo = {
      charge: req.query.chargeid,
      amount: req.body.amount,
      reason: 'requested_by_customer',
      metadata: {
        appid: req.appid
      }
    }
    const refund = await stripeCache.execute('refunds', 'create', refundInfo, req.stripeKey)
    await stripeCache.delete(req.query.chargeid, req.stripeKey)
    return refund
  }
}
