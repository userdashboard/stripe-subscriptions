const stripe = require('stripe')()

module.exports = {
  lock: true,
  before: async (req) => {
    if (!req.query || !req.query.planid) {
      throw new Error('invalid-planid')
    }
    let plan
    try {
      plan = await stripe.plans.retrieve(req.query.planid, req.stripeKey)
    } catch (error) {
    }
    if (!plan) {
      throw new Error('invalid-planid')
    }
  },
  delete: async (req) => {
    try {
      await stripe.plans.del(req.query.planid, req.stripeKey)
      req.success = true
    } catch (error) {
      throw new Error('unknown-error')
    }
  }
}
