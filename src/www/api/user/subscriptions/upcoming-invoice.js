const stripe = require('stripe')()

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.subscriptionid) {
      throw new Error('invalid-subscriptionid')
    }
    let dispute
    try {
      dispute = await stripe.disputes.retrieveUpcoming(req.customer.id, req.query.subscriptionid, req.stripeKey)
    } catch (error) {
    }
    if (!dispute) {
      throw new Error('invalid-subscriptionid')
    }
    return dispute
  }
}
