const stripe = require('stripe')()

module.exports = {
  lock: true,
  before: async (req) => {
    if (!req.query || !req.query.customerid) {
      throw new Error('invalid-customerid')
    }
    let customer
    try {
      customer = await stripe.customers.retrieve(req.query.customerid, req.stripeKey)
    } catch (error) {
    }
    if (!customer) {
      throw new Error('invalid-customerid')
    }
    if (!customer.discount) {
      throw new Error('invalid-customer')
    }
  },
  delete: async (req) => {
    const updateInfo = {
      coupon: null
    }
    try {
      await stripe.customers.update(req.query.customerid, updateInfo, req.stripeKey)
      req.success = true
    } catch (error) {
      throw new Error('unknown-error')
    }
  }
}
