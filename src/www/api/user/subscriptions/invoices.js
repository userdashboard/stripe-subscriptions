const RedisListIndex = require('../../../../redis-list-index.js')

module.exports = {
  get: async (req) => {
    const offset = req.query && req.query.offset ? parseInt(req.query.offset, 10) : 0
    const itemids = await RedisListIndex.page(`customer:invoices:${req.customer.id}`, offset)
    return RedisListIndex.loadMany(itemids)
  }
}
