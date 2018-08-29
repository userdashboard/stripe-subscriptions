const dashboard = require('@userappstore/dashboard')
const stripe = require('stripe')()

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.customerid) {
      throw new Error('invalid-customerid')
    }
    const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0
    const itemids = await dashboard.RedisList.list(`${req.appid}:customer:cards:${req.query.customerid}`, offset)
    if (!itemids || !itemids.length) {
      return null
    }
    const items = []
    for (const cardid of itemids) {
      const customer = await stripe.customers.retrieveCard(req.query.customerid, cardid, req.stripeKey)
      items.push(customer)
    }
    return items
  }
}
