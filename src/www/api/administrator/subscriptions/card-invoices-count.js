const dashboard = require('@userappstore/dashboard')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.cardid) {
      throw new Error('invalid-cardid')
    }
    const count = await dashboard.RedisList.count(`card:invoices:${req.query.cardid}`)
    return count
  }
}
