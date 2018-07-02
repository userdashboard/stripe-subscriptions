const dashboard = require('@userappstore/dashboard')
const stripe = require('stripe')()

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.disputeid) {
      throw new Error('invalid-disputeid')
    }
    let dispute
    try {
      dispute = await stripe.disputes.retrieve(req.query.disputeid, req.stripeKey)
    } catch (error) {
    }
    if (!dispute) {
      const exists = await dashboard.RedisList.exists(`disputes`, req.query.disputeid)
      if (exists) {
        throw new Error('invalid-account')
      }
      throw new Error('invalid-disputeid')
    }
    if (dispute.customer !== req.customer.id) {
      throw new Error('invalid-account')
    }
    dispute.date = dashboard.Timestamp.date(dispute.date)
    return dispute
  }
}
