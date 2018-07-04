const dashboard = require('@userappstore/dashboard')
const stripe = require('stripe')()

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.customerid) {
      throw new Error('invalid-customerid')
    }
    const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0
    const itemids = await dashboard.RedisList.list(`payouts`, offset)
    if (!itemids || !itemids.length) {
      return null
    }
    const items = []
    for (const payoutid of itemids) {
      const payout = await stripe.payouts.retrieve(payoutid, req.stripeKey)
      items.push(payout)
    }
    return items
  }
}
