const stripe = require('stripe')()

module.exports = {
  lock: true,
  before: async (req) => {
    if (!req.query || !req.query.chargeid) {
      throw new Error('invalid-chargeid')
    }
    let charge
    try {
      charge = await stripe.charges.retrieve(req.query.chargeid, req.stripeKey)
    } catch (error) {
    }
    if (!charge) {
      throw new Error('invalid-chargeid')
    }
    const invoice = await stripe.invoices.retrieve(charge.invoice, req.stripeKey)
    if (invoice.customer !== req.customer.id) {
      throw new Error('invalid-account')
    }
    req.charge = charge
  },
  patch: async (req) => {
    const refundInfo = {
      charge: req.charge.id,
      amount: req.charge.amount - (req.charge.amount_refunded || 0),
      reason: 'requested_by_customer'
    }
    try {
      const refund = await stripe.refunds.create(refundInfo, req.stripeKey)
      req.success = true
      return refund
    } catch (error) {
      throw new Error('unknown-error')
    }
  }
}
