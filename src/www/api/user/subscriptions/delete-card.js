const RedisListIndex = require('../../../../redis-list-index.js')
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
      await RedisListIndex.remove('cards', req.query.cardid)
      await RedisListIndex.remove(`customer:cards:${req.customer.id}`, req.query.cardid)
      req.success = true
    } catch (error) {
      throw new Error('unknown-error')
    }
  }
}
