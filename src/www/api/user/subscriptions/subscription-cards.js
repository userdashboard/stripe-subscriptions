const dashboard = require('@userappstore/dashboard')
const stripe = require('stripe')()

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.subscriptionid) {
      throw new Error('invalid-subscriptionid')
    }
    const offset = req.query && req.query.offset ? parseInt(req.query.offset, 10) : 0
    const cardids = await dashboard.RedisList.list(`subscription:cards:${req.query.subscriptionid}`, offset)
    if (!cardids || !cardids.length) {
      return null
    }
    const cards = []
    for (const cardid of cardids) {
      const card = await stripe.subscriptions.retrieveCard(req.customer.id, cardid, req.stripeKey)
      cards.push(card)
    }
    return cards
  }
}
