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
    if (!charge.refunded || (charge.fraud_details && charge.fraud_details.user_report === 'fraudulent')) {
      throw new Error('invalid-charge')
    }
  },
  patch: async (req) => {
    const chargeInfo = {
      fraud_details: {
        user_report: 'fraudulent'
      }
    }
    try {
      const charge = await stripe.charges.update(req.query.chargeid, chargeInfo, req.stripeKey)
      req.success = true
      return charge
    } catch (error) {
      if (error.message.indexOf('is greater than')) {
        throw new Error('invalid-amount')
      }
      throw new Error('unknown-error')
    }
  }
}
