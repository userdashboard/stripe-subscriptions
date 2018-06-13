const RedisListIndex = require('../../../../redis-list-index.js')
const stripe = require('stripe')()

module.exports = {
  get: async (req) => {
    const invoices = []
    const subscriptionids = await RedisListIndex.lrange(`customer:subscriptions:${req.customer.id}`)
    for (const subscriptionid of subscriptionids) {
      const invoice = await stripe.invoices.retrieveUpcoming(req.customer.id, subscriptionid, req.stripeKey)
      invoices.push(invoice)
    }
    if (!invoices.length) {
      return null
    }
    return invoices
  }
}
