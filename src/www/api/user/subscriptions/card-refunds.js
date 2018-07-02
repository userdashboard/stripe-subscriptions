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
    const offset = req.query && req.query.offset ? parseInt(req.query.offset, 10) : 0
    const itemids = await dashboard.RedisList.list(`card:refunds:${req.query.cardid}`, offset)
    if (!itemids || !itemids.length) {
      return null
    }
    const items = []
    for (const refundid of itemids) {
      const refund = await stripe.refunds.retrieve(refundid, req.stripeKey)
      items.push(refund)
    }
    return items
  }
}
