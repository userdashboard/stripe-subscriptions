const stripeCache = require('../../../../stripe-cache.js')

module.exports = {
  auth: false,
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
    if (!plan.metadata.published) {
      throw new Error('invalid-plan')
    }
    return plan
  }
}
