const RedisListIndex = require('../../../../redis-list-index.js')

module.exports = {
  get: async (req) => {
    const itemids = await RedisListIndex.count(`published:products`)
    return RedisListIndex.loadMany(itemids)
  }
}
