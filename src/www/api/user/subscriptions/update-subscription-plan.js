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
    const newPlan = await stripe.plans.retrieve(req.body.planid, req.stripeKey)
    if (!newPlan.metadata.published || newPlan.metadata.unpublished) {
      throw new Error('invalid-plan')
    }
  },
  patch: async (req) => {
    const updateInfo = {
      plan: req.body.planid
    }
    try {
      await stripe.subscriptions.update(req.query.subscriptionid, updateInfo, req.stripeKey)
      req.success = true
    } catch (error) {
      if (error.message.indexOf('This customer has no attached payment source') === 0) {
        throw new Error('invalid-payment-source')
      }
      throw new Error('unknown-error')
    }
  }
}
