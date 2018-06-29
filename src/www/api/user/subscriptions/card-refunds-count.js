const dashboard = require('@userappstore/dashboard')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.cardid) {
      throw new Error('invalid-cardid')
    }
    const count = await dashboard.RedisList.count(`card:refunds:${req.query.cardid}`)
    const all = await dashboard.RedisList.listAll(`card:refunds:${req.query.cardid}`)
    console.log(all)
    return count
  }
}
