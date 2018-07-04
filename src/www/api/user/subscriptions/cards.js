const dashboard = require('@userappstore/dashboard')
const stripe = require('stripe')()

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.customerid) {
      throw new Error('invalid-customerid')
    }
    if (req.customer.id !== req.query.customerid) {
      throw new Error('invalid-customer')
    }
    const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0
    const cardids = await dashboard.RedisList.list(`customer:cards:${req.query.customerid}`, offset)
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
