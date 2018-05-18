const stripe = require('stripe')()

module.exports = {
  get: async (req) => {
    const plans = await stripe.plans.list(req.stripeKey)
    if (plans && plans.data && plans.data.length) {
      for (const plan of plans.data) {
        plan.created = global.dashboard.Timestamp.date(plan.created)
        plan.text = plan.metadata.display.register
      }
    }
    return plans.data
  }
}
