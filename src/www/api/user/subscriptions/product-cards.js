const dashboard = require('@userappstore/dashboard')
const stripe = require('stripe')()

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.productid) {
      throw new Error('invalid-productid')
    }
    const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0
    const cardids = await dashboard.RedisList.list(`${req.appid}:product:cards:${req.query.productid}`, offset)
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
