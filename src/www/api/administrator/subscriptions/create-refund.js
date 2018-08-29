const stripe = require('stripe')()

module.exports = {
  lock: true,
  before: async (req) => {
    if (!req.query || !req.query.chargeid) {
      throw new Error('invalid-chargeid')
    }
    if (!req.body || !req.body.amount) {
      throw new Error('invalid-amount')
    }
    let charge
    try {
      charge = await stripe.charges.retrieve(req.query.chargeid, req.stripeKey)
    } catch (error) {
    }
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
  },
  post: async (req) => {
    const refundInfo = {
      charge: req.query.chargeid,
      amount: req.body.amount,
      reason: 'requested_by_customer',
      metadata: {
        appid: req.headers['x-appid'] || process.env.APPID
      }
    }
    try {
      const refund = await stripe.refunds.create(refundInfo, req.stripeKey)
      req.success = true
      return refund
    } catch (error) {
      if (error.message.indexOf('is greater than')) {
        throw new Error('invalid-amount')
      }
      throw new Error('unknown-error')
    }
  }
}
