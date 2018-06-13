const stripe = require('stripe')()

module.exports = {
  auth: false,
  get: async (req) => {
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
    plan.trialPeriodDays = plan.trial_period_days || 0
    plan.priceFormatted = plan.currency === 'usd' ? '$' + (plan.amount / 100) : plan.amount
    plan.metadata.display = plan.metadata.display || {}
    plan.metadata.display.registration = plan.metadata.display.registration || '-'
    plan.metadata.display.newSubscription = plan.metadata.display.newSubscription || '-'
    plan.metadata.display.editSubscription = plan.metadata.display.updateSubscription || '-'
    return plan
  }
}
