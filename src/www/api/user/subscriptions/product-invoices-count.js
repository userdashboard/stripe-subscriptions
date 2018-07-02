const dashboard = require('@userappstore/dashboard')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.productid) {
      throw new Error('invalid-productid')
    }
    const total = await dashboard.RedisList.count(`product:invoices:${req.query.productid}`, req.stripeKey)
    return total
  }
}
