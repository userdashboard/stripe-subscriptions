const dashboard = require('@userappstore/dashboard')
const stripe = require('stripe')()

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.couponid) {
      throw new Error('invalid-couponid')
    }
    const offset = req.query && req.query.offset ? parseInt(req.query.offset, 10) : 0
    const itemids = await dashboard.RedisList.list(`coupon:subscriptions:${req.query.couponid}`, offset)
    if (!itemids || !itemids.length) {
      return null
    }
    const items = []
    for (const subscriptionid of itemids) {
      const item = await stripe.subscriptions.retrieve(subscriptionid, req.stripeKey)
      items.push(item)
    }
    return items
  }
}
