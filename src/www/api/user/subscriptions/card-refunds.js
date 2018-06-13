const RedisListIndex = require('../../../../redis-list-index.js')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.cardid) {
      throw new Error('invalid-cardid')
    }
    const offset = req.query && req.query.offset ? parseInt(req.query.offset, 10) : 0
    const itemids = await RedisListIndex.page(`refunds:card:${req.query.cardid}`, offset)
    return RedisListIndex.loadMany(itemids)
  }
}
