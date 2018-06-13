const RedisListIndex = require('../../../../redis-list-index.js')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.subscriptionid) {
      throw new Error('invalid-subscriptionid')
    }
    const count = await RedisListIndex.count(`refunds:subscription:${req.query.subscriptionid}`)
    return count
  }
}
