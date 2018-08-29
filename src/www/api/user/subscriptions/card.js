const dashboard = require('@userappstore/dashboard')
const stripe = require('stripe')()

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.cardid) {
      throw new Error('invalid-cardid')
    }
    const exists = await dashboard.RedisList.exists(`${req.appid}:cards`, req.query.cardid)
    if (!exists) {
      throw new Error('invalid-cardid')
    }
    const owned = await dashboard.RedisList.exists(`${req.appid}:customer:cards:${req.customer.id}`, req.query.cardid)
    if (!owned) {
      throw new Error('invalid-account')
    }
    let card
    try {
      card = await stripe.customers.retrieveCard(req.customer.id, req.query.cardid, req.stripeKey)
    } catch (error) {
    }
    if (!card) {
      throw new Error('invalid-cardid')
    }
    if (card.customer !== req.customer.id) {
      throw new Error('invalid-account')
    }
    card.date = dashboard.Timestamp.date(card.created)
    return card
  }
}
