const dashboard = require('@userappstore/dashboard')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.productid) {
      throw new Error('invalid-productid')
    }
    return dashboard.RedisList.count(`${req.appid}:product:charges:${req.query.productid}`, req.stripeKey)
  }
}
