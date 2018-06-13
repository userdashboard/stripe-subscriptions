const RedisListIndex = require('../../../../redis-list-index.js')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.productid) {
      throw new Error('invalid-productid')
    }
    const count = await RedisListIndex.count(`invoices:product:${req.query.productid}`)
    return count
  }
}
