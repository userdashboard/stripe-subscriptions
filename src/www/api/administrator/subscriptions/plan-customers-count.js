const RedisListIndex = require('../../../../redis-list-index.js')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.planid) {
      throw new Error('invalid-planid')
    }
    const count = await RedisListIndex.count(`customers:plan:${req.query.planid}`)
    return count
  }
}
