const RedisListIndex = require('../../../../redis-list-index.js')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.cardid) {
      throw new Error('invalid-cardid')
    }
    const count = await RedisListIndex.count(`refunds:card:${req.query.cardid}`)
    return count
  }
}
