const stripeCache = require('../../../../stripe-cache.js')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.refundid) {
      throw new Error('invalid-refundid')
    }
    let refund
    try {
      refund = await stripeCache.retrieve(req.query.refundid, 'refunds', req.stripeKey)
    } catch (error) {
    }
    if (!refund) {
      throw new Error('invalid-refundid')
    }
    return refund
  }
}
