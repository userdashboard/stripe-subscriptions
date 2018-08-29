const dashboard = require('@userappstore/dashboard')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.cardid) {
      throw new Error('invalid-cardid')
    }
    const exists = await dashboard.RedisList.exists(`${req.appid}:cards`, req.query.cardid)
    if (!exists) {
      throw new Error('invalid-cardid')
    }
    const owned = await dashboard.RedisList.exists(`${req.appid}:customer:cards:${req.customer.id}`, req.query.cardid)
    if (!owned) {
      throw new Error('invalid-account')
    }
    return dashboard.RedisList.count(`${req.appid}:card:charges:${req.query.cardid}`)
  }
}
