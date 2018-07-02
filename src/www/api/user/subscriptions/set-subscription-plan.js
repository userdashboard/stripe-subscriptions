const stripe = require('stripe')()

module.exports = {
  lock: true,
  before: async (req) => {
    if (!req.query || !req.query.subscriptionid) {
      throw new Error('invalid-subscriptionid')
    }
    if (!req.body || !req.body.planid) {
      throw new Error('invalid-planid')
    }
    let subscription
    try {
      subscription = await stripe.subscriptions.retrieve(req.query.subscriptionid, req.stripeKey)
    } catch (error) {
    }
    if (!subscription) {
      throw new Error('invalid-subscriptionid')
    }
    if (subscription.customer !== req.customer.id) {
      throw new Error('invalid-account')
    }
    if (subscription.plan === req.body.planid) {
      throw new Error('invalid-plan')
    }
    if (subscription.plan && subscription.plan.id && subscription.plan.id === req.body.planid) {
      throw new Error('invalid-plan')
    }
    const newPlan = await stripe.plans.retrieve(req.body.planid, req.stripeKey)
    if (!newPlan.metadata.published || newPlan.metadata.unpublished) {
      throw new Error('invalid-plan')
    }
    if (newPlan.amount && !req.customer.default_source) {
      throw new Error('invalid-cardid')
    }
  },
  patch: async (req) => {
    const updateInfo = {
      plan: req.body.planid
    }
    try {
      const subscription = await stripe.subscriptions.update(req.query.subscriptionid, updateInfo, req.stripeKey)
      req.success = true
      return subscription
    } catch (error) {
      throw new Error('unknown-error')
    }
  }
}
