const RedisListIndex = require('../../../../redis-list-index.js')
const stripe = require('stripe')()

module.exports = {
  lock: true,
  before: async (req) => {
    if (!req.query || !req.query.couponid) {
      throw new Error('invalid-couponid')
    }
    let coupon
    try {
      coupon = await stripe.coupons.retrieve(req.query.couponid, req.stripeKey)
    } catch (error) {
    }
    if (!coupon) {
      throw new Error('invalid-couponid')
    }
  },
  delete: async (req) => {
    try {
      await stripe.coupons.del(req.query.couponid, req.stripeKey)
      await RedisListIndex.remove(`coupons`, req.query.couponid)
      await RedisListIndex.remove(`published:coupons`, req.query.couponid)
      await RedisListIndex.remove(`unpublished:coupons`, req.query.couponid)
      req.success = true
      return
    } catch (error) {
      throw new Error('unknown-error')
    }
  }
}
