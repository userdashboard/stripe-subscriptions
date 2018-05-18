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
    // verify refund belongs to account holder
    const charge = await stripe.charges.retrieve(refund.charge, req.stripeKey)
    if (charge.customer !== req.customer.id) {
      throw new Error('invalid-account')
    }
    return refund
  }
}
