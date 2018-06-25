const dashboard = require('@userappstore/dashboard')
const stripe = require('stripe')()

module.exports = {
  lock: true,
  before: async (req) => {
    if (!req.query || !req.query.cardid) {
      throw new Error('invalid-subscriptionid')
    }
    let card
    try {
      card = await stripe.customers.retrieveCard(req.customer.id, req.query.cardid, req.stripeKey)
    } catch (error) {
    }
    if (!card) {
      throw new Error('invalid-cardid')
    }
  },
  delete: async (req) => {
    try {
      await stripe.customers.deleteSource(req.customer.id, req.query.cardid, req.stripeKey)
      await dashboard.RedisList.remove('cards', req.query.cardid)
      await dashboard.RedisList.remove(`customer:cards:${req.customer.id}`, req.query.cardid)
      req.success = true
    } catch (error) {
      throw new Error('unknown-error')
    }
  }
}
