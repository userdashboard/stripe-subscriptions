const dashboard = require('@userappstore/dashboard')
const stripe = require('stripe')()

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.cardid) {
      throw new Error('invalid-cardid')
    }
    const cardExists = await dashboard.RedisList.exists(`cards`, req.query.cardid)
    const ownCardExists = cardExists ? await dashboard.RedisList.exists(`customer:cards:${req.customer.id}`, req.query.cardid) : false
    if (!ownCardExists) {
      if (cardExists) {
        throw new Error('invalid-account')
      }
      throw new Error('invalid-cardid')
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
