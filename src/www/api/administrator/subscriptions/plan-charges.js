const dashboard = require('@userappstore/dashboard')
const stripe = require('stripe')()

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.planid) {
      throw new Error('invalid-planid')
    }
    const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0
    const itemids = await dashboard.RedisList.list(`${req.appid}:plan:charges:${req.query.planid}`, offset)
    if (!itemids || !itemids.length) {
      return null
    }
    const items = []
    for (const chargeid of itemids) {
      const charge = await stripe.charges.retrieve(chargeid, req.stripeKey)
      items.push(charge)
    }
    return items
  }
}
