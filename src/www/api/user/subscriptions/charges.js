const dashboard = require('@userappstore/dashboard')
const stripe = require('stripe')()

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.customerid) {
      throw new Error('invalid-customerid')
    }
    if (req.customer.id !== req.query.customerid) {
      throw new Error('invalid-customer')
    }
    const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0
    const itemids = await dashboard.RedisList.list(`${req.appid}:customer:charges:${req.query.customerid}`, offset)
    if (!itemids || !itemids.length) {
      return null
    }
    const items = []
    for (const chargeid of itemids) {
      const item = await stripe.charges.retrieve(chargeid, req.stripeKey)
      items.push(item)
    }
    return items
  }
}
