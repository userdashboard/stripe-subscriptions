const dashboard = require('@userappstore/dashboard')
const stripe = require('stripe')()

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.subscriptionid) {
      throw new Error('invalid-subscriptionid')
    }
    const exists = await dashboard.RedisList.exists(`${req.appid}:subscriptions`, req.query.subscriptionid)
    if (!exists) {
      throw new Error('invalid-subscriptionid')
    }
    const owned = await dashboard.RedisList.exists(`${req.appid}:customer:subscriptions:${req.customer.id}`, req.query.subscriptionid)
    if (!owned) {
      throw new Error('invalid-account')
    }
    const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0
    const cardids = await dashboard.RedisList.list(`${req.appid}:subscription:cards:${req.query.subscriptionid}`, offset)
    if (!cardids || !cardids.length) {
      return null
    }
    const cards = []
    for (const cardid of cardids) {
      const card = await stripe.customers.retrieveCard(req.customer.id, cardid, req.stripeKey)
      cards.push(card)
    }
    return cards
  }
}
