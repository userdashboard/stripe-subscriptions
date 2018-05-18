const stripe = require('stripe')()

module.exports = {
  get: async (req) => {
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
    if (req.customer && req.customer.id !== req.query.customerid) {
      throw new Error('invalid-account')
    }
    customer.date = global.dashboard.Timestamp.date(customer.date)
    return customer
  }
}
