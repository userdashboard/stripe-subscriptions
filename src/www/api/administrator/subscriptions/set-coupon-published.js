const dashboard = require('@userappstore/dashboard')
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
    if (coupon.metadata.published || coupon.metadata.unpublished) {
      throw new Error('invalid-coupon')
    }
  },
  patch: async (req) => {
    const updateInfo = {
      metadata: {
        published: dashboard.Timestamp.now
      }
    }
    try {
      await stripe.coupons.update(req.query.couponid, updateInfo, req.stripeKey)
      await RedisListIndex.add('published:coupons', req.query.couponid)
      req.success = true
    } catch (error) {
      throw new Error('unknown-error')
    }
  }
}
