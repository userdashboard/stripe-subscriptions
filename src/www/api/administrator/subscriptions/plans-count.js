const RedisListIndex = require('../../../../redis-list-index.js')

module.exports = {
  get: async (req) => {
    const count = await RedisListIndex.count(`plans`)
    return count
  }
}
