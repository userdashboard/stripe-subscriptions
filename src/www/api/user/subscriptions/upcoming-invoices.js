const stripe = require('stripe')()

module.exports = {
  get: async (req) => {
    const invoices = []
    const subscriptions = await stripe.subscriptions.list({ customer: req.customer.id }, req.stripeKey)
    for (const subscription of subscriptions.data) {
      const invoice = await stripe.invoices.retrieveUpcoming(req.customer.id, subscription.id, req.stripeKey)
      invoices.push(invoice)
    }
    if (!invoices.length) {
      return null
    }
    return invoices
  }
}
