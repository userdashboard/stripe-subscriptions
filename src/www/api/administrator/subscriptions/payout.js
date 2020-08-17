const stripeCache = require('../../../../stripe-cache.js')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.payoutid) {
      throw new Error('invalid-payoutid')
    }
    let payout
    try {
      payout = await stripeCache.retrieve(req.query.payoutid, 'payouts', req.stripeKey)
    } catch (error) {
    }
    if (!payout) {
      throw new Error('invalid-payoutid')
    }
    return payout
  }
}
