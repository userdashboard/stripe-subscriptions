const dashboard = require('@userappstore/dashboard')
const stripe = require('stripe')()

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.refundid) {
      throw new Error('invalid-refundid')
    }
    const exists = await dashboard.RedisList.exists(`${req.appid}:refunds`, req.query.refundid)
    if (!exists) {
      throw new Error('invalid-refundid')
    }
    const owned = await dashboard.RedisList.exists(`${req.appid}:customer:refunds:${req.customer.id}`, req.query.refundid)
    if (!owned) {
      throw new Error('invalid-account')
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
