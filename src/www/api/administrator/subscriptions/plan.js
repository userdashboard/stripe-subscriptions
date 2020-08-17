const stripeCache = require('../../../../stripe-cache.js')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.planid) {
      throw new Error('invalid-planid')
    }
    let plan
    try {
      plan = await stripeCache.retrieve(req.query.planid, 'plans', req.stripeKey)
    } catch (error) {
    }
    if (!plan) {
      throw new Error('invalid-planid')
    }
    return plan
  }
}
