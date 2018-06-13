const RedisListIndex = require('../../../../redis-list-index.js')

module.exports = {
  get: async (req) => {
    const itemids = await RedisListIndex.count(`customer:subscriptions:${req.customer.id}`)
    return RedisListIndex.loadMany(itemids)
  }
}
