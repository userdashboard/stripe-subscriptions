const stripe = require('stripe')()

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.subscriptionid) {
      throw new Error('invalid-subscriptionid')
    }
    let invoice
    try {
      invoice = await stripe.invoices.retrieveUpcoming(req.customer.id, req.query.subscriptionid, req.stripeKey)
    } catch (error) {
    }
    if (!invoice) {
      throw new Error('invalid-subscriptionid')
    }
    return invoice
  }
}
