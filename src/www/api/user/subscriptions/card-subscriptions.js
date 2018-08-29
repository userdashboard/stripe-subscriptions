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
    const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0
    const itemids = await dashboard.RedisList.list(`${req.appid}:card:subscriptions:${req.query.cardid}`, offset)
    if (!itemids || !itemids.length) {
      return null
    }
    const items = []
    for (const subscriptionid of itemids) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionid, req.stripeKey)
      items.push(subscription)
    }
    return items
  }
}
