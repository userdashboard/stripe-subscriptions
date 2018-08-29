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
    const customerid = await global.redisClient.hgetAsync(`map:cardid:customerid`, req.query.cardid)
    let card
    try {
      card = await stripe.customers.retrieveCard(customerid, req.query.cardid, req.stripeKey)
    } catch (error) {
    }
    if (!card) {
      throw new Error('invalid-cardid')
    }
    card.date = dashboard.Timestamp.date(card.created)
    return card
  }
}
