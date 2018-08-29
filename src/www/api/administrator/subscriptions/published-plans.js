const dashboard = require('@userappstore/dashboard')
const stripe = require('stripe')()

module.exports = {
  get: async (req) => {
    const offset = req.query && req.query.offset ? parseInt(req.query.offset, 10) : 0
    const itemids = await dashboard.RedisList.list(`${req.appid}:published:plans`, offset)
    if (!itemids || !itemids.length) {
      return null
    }
    const items = []
    for (const planid of itemids) {
      const plan = await stripe.plans.retrieve(planid, req.stripeKey)
      items.push(plan)
    }
    return items
  }
}
