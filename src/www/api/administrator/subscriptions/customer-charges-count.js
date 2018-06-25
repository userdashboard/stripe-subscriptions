const dashboard = require('@userappstore/dashboard')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.customerid) {
      throw new Error('invalid-customerid')
    }
    const count = await dashboard.RedisList.count(`charges:customer:${req.query.customerid}`)
    return count
  }
}
