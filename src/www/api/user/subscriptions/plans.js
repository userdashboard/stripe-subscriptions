const dashboard = require('@userappstore/dashboard')
const stripe = require('stripe')()

module.exports = {
  auth: false,
  get: async (req) => {
    const plans = await stripe.plans.list(req.stripeKey)
    const activePlans = []
    if (plans && plans.data && plans.data.length) {
      for (const plan of plans.data) {
        if (!plan.metadata.published || plan.metadata.unpublished) {
          continue
        }
        plan.created = dashboard.Timestamp.date(plan.created)
        plan.text = plan.metadata.display.register
        activePlans.push(plan)
      }
    }
    return activePlans
  }
}
