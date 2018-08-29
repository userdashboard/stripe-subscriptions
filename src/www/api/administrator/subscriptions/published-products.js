const dashboard = require('@userappstore/dashboard')
const stripe = require('stripe')()

module.exports = {
  get: async (req) => {
    const offset = req.query && req.query.offset ? parseInt(req.query.offset, 10) : 0
    const itemids = await dashboard.RedisList.list(`${req.appid}:published:products`, offset)
    if (!itemids || !itemids.length) {
      return null
    }
    const items = []
    for (const productid of itemids) {
      const product = await stripe.products.retrieve(productid, req.stripeKey)
      items.push(product)
    }
    return items
  }
}
