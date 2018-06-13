const RedisListIndex = require('../../../../redis-list-index.js')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.subscriptionid) {
      throw new Error('invalid-subscriptionid')
    }
    const itemids = await RedisListIndex.count(`subscription:invoices:${req.query.subscriptionid}`)
    return RedisListIndex.loadMany(itemids)
  }
}
