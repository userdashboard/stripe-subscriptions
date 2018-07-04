const dashboard = require('@userappstore/dashboard')
const stripe = require('stripe')()

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.planid) {
      throw new Error('invalid-planid')
    }
    const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0
    const itemids = await dashboard.RedisList.list(`plan:customers:${req.query.planid}`, offset)
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
