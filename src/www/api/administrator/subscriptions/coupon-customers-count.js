const dashboard = require('@userappstore/dashboard')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.couponid) {
      throw new Error('invalid-couponid')
    }
    const count = await dashboard.RedisList.count(`coupon:customers:${req.query.couponid}`)
    return count
  }
}
