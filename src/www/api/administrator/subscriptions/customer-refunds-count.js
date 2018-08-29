const dashboard = require('@userappstore/dashboard')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.customerid) {
      throw new Error('invalid-customerid')
    }
    return dashboard.RedisList.count(`${req.appid}:customer:refunds:${req.query.customerid}`)
  }
}
