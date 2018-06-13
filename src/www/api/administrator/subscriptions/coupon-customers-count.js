const RedisListIndex = require('../../../../redis-list-index.js')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.couponid) {
      throw new Error('invalid-couponid')
    }
    const count = await RedisListIndex.count(`customers:coupon:${req.query.couponid}`)
    return count
  }
}
