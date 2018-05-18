const stripe = require('stripe')()

module.exports = {
  get: async (req) => {
    const cards = await stripe.customers.listCards(req.customer.id, req.stripeKey)
    if (!cards || !cards.data || !cards.data.length) {
      return null
    }
    for (const card of cards.data) {
      card.date = global.dashboard.Timestamp.date(card.created)
    }
    return cards.data
  }
}
