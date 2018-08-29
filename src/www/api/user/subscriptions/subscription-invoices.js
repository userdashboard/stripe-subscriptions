const dashboard = require('@userappstore/dashboard')
const stripe = require('stripe')()

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.subscriptionid) {
      throw new Error('invalid-subscriptionid')
    }
    const exists = await dashboard.RedisList.exists(`${req.appid}:subscriptions`, req.query.subscriptionid)
    if (!exists) {
      throw new Error('invalid-subscriptionid')
    }
    const owned = await dashboard.RedisList.exists(`${req.appid}:customer:subscriptions:${req.customer.id}`, req.query.subscriptionid)
    if (!owned) {
      throw new Error('invalid-account')
    }
    const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0
    const itemids = await dashboard.RedisList.list(`${req.appid}:subscription:invoices:${req.query.subscriptionid}`, offset)
    if (!itemids || !itemids.length) {
      return null
    }
    const items = []
    for (const invoiceid of itemids) {
      const invoice = await stripe.invoices.retrieve(invoiceid, req.stripeKey)
      items.push(invoice)
    }
    return items
  }
}
