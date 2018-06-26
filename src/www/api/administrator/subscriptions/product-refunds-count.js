const dashboard = require('@userappstore/dashboard')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.productid) {
      throw new Error('invalid-productid')
    }
    const count = await dashboard.RedisList.count(`product:refunds:${req.query.productid}`)
    return count
  }
}