const RedisListIndex = require('../../../../redis-list-index.js')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.customerid) {
      throw new Error('invalid-customerid')
    }
    const offset = req.query && req.query.offset ? parseInt(req.query.offset, 10) : 0
    const itemids = await RedisListIndex.page(`subscriptions:customer:${req.query.customerid}`, offset)
    return RedisListIndex.loadMany(itemids)
  }
}
