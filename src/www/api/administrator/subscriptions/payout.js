const stripe = require('stripe')()

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.payoutid) {
      throw new Error('invalid-payoutid')
    }
    let payout
    try {
      payout = await stripe.payouts.retrieve(req.query.payoutid, req.stripeKey)
    } catch (error) {
    }
    if (!payout) {
      throw new Error('invalid-payoutid')
    }
    return payout
  }
}
