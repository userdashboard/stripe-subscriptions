const dashboard = require('@userappstore/dashboard')
const stripe = require('stripe')()

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.subscriptionid) {
      throw new Error('invalid-subscriptionid')
    }
    const offset = req.query && req.query.offset ? parseInt(req.query.offset, 10) : 0
    const itemids = await dashboard.RedisList.list(`subscription:charges:${req.query.subscriptionid}`, offset)
    if (!itemids || !itemids.length) {
      return null
    }
    const items = []
    for (const chargeid of itemids) {
      const charge = await stripe.disputes.retrieve(chargeid, req.stripeKey)
      items.push(charge)
    }
    return items
  }
}
