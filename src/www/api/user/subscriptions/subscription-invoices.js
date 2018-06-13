const RedisListIndex = require('../../../../redis-list-index.js')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.subscriptionid) {
      throw new Error('invalid-subscriptionid')
    }
    const offset = req.query && req.query.offset ? parseInt(req.query.offset, 10) : 0
    const itemids = await RedisListIndex.page(`subscription:invoices:${req.query.subscriptionid}`, offset)
    return RedisListIndex.loadMany(itemids)
  }
}
