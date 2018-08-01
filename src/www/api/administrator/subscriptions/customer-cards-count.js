const dashboard = require('@userappstore/dashboard')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.customerid) {
      throw new Error('invalid-customerid')
    }
    return dashboard.RedisList.count(`customer:cards:${req.query.customerid}`)
  }
}
