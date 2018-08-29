const dashboard = require('@userappstore/dashboard')
const stripe = require('stripe')()

module.exports = {
  auth: false,
  get: async (req) => {
    const offset = req.query && req.query.offset ? parseInt(req.query.offset, 10) : 0
    const itemids = await dashboard.RedisList.list(`${req.appid}:customer:refunds:${req.customer.id}`, offset)
    if (!itemids || !itemids.length) {
      return null
    }
    const items = []
    for (const refundid of itemids) {
      const item = await stripe.refunds.retrieve(refundid, req.stripeKey)
      items.push(item)
    }
    return items
  }
}
