const RedisListIndex = require('../../../../redis-list-index.js')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.customerid) {
      throw new Error('invalid-customerid')
    }
    const count = await RedisListIndex.count(`invoices:customer:${req.query.customerid}`)
    return count
  }
}
