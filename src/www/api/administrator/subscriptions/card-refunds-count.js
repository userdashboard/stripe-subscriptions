const dashboard = require('@userappstore/dashboard')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.cardid) {
      throw new Error('invalid-cardid')
    }
    return dashboard.RedisList.count(`card:refunds:${req.query.cardid}`)
  }
}
