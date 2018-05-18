const stripe = require('stripe')()

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.refundid) {
      throw new Error('invalid-refundid')
    }
    let refund
    try {
      refund = await stripe.refunds.retrieve(req.query.refundid, req.stripeKey)
    } catch (error) {
    }
    if (!refund) {
      throw new Error('invalid-refundid')
    }
    return refund
  }
}
