const dashboard = require('@userappstore/dashboard')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.couponid) {
      throw new Error('invalid-couponid')
    }
    return dashboard.RedisList.count(`${req.appid}:coupon:customers:${req.query.couponid}`)
  }
}
