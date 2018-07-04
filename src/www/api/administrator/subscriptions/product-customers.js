const dashboard = require('@userappstore/dashboard')
const stripe = require('stripe')()

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.productid) {
      throw new Error('invalid-productid')
    }
    const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0
    const itemids = await dashboard.RedisList.list(`product:customers:${req.query.productid}`, offset)
    if (!itemids || !itemids.length) {
      return null
    }
    const items = []
    for (const customerid of itemids) {
      const customer = await stripe.customers.retrieve(customerid, req.stripeKey)
      items.push(customer)
    }
    return items
  }
}
