const dashboard = require('@userappstore/dashboard')
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
    if (!plan.metadata.published || plan.metadata.unpublished) {
      throw new Error('invalid-plan')
    }
  },
  patch: async (req) => {
    const updateInfo = {
      metadata: {
        unpublished: dashboard.Timestamp.now
      }
    }
    try {
      await stripe.plans.update(req.query.planid, updateInfo, req.stripeKey)
      await dashboard.RedisList.remove('published:plans', req.query.planid)
      await dashboard.RedisList.add('unpublished:plans', req.query.planid)
      req.success = true
    } catch (error) {
      throw new Error('unknown-error')
    }
  }
}