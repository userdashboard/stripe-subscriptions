const dashboard = require('@userappstore/dashboard')
const stripe = require('stripe')()

module.exports = {
  get: async (req) => {
    const offset = req.query && req.query.offset ? parseInt(req.query.offset, 10) : 0
    const itemids = await dashboard.RedisList.list(`unpublished:coupons`, offset)
    if (!itemids || !itemids.length) {
      return null
    }
    const items = []
    for (const couponid of itemids) {
      const coupon = await stripe.subscriptions.retrieve(couponid, req.stripeKey)
      items.push(coupon)
    }
    return items
  }
}
