const dashboard = require('@userappstore/dashboard')
const stripe = require('stripe')()

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.couponid) {
      throw new Error('invalid-couponid')
    }
    const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0
    const itemids = await dashboard.RedisList.list(`coupon:customers:${req.query.couponid}`, offset)
    if (!itemids || !itemids.length) {
      return null
    }
    const items = []
    for (const customerid of itemids) {
      const item = await stripe.customers.retrieve(customerid, req.stripeKey)
      items.push(item)
    }
    return items
  }
}
