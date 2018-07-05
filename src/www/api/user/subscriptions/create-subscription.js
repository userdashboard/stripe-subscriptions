const dashboard = require('@userappstore/dashboard')
const stripe = require('stripe')()

module.exports = {
  lock: true,
  before: async (req) => {
    if (!req.query || !req.query.planid) {
      throw new Error('invalid-planid')
    }
    const plan = await global.api.user.subscriptions.PublishedPlan.get(req)
    req.query.customerid = req.customer.id
    if (!req.customer.default_source && plan.amount) {
      throw new Error('invalid-cardid')
    }
    const subscriptions = await global.api.user.subscriptions.Subscriptions.get(req)
    if (subscriptions && subscriptions.length) {
      for (const subscription of subscriptions) {
        if (subscription.plan === req.query.planid) {
          throw new Error('duplicate-subscription')
        }
      }
    }
    req.plan = plan
  },
  post: async (req) => {
    const subscriptions = await global.api.user.subscriptions.Subscriptions.get(req)
    if (subscriptions && subscriptions.length) {
      for (const subscription of subscriptions) {
        if (subscription.plan === req.query.planid) {
          throw new Error('duplicate-subscription')
        }
      }
    }
    const subscriptionInfo = {
      customer: req.customer.id,
      items: [{
        plan: req.query.planid
      }]
    }
    try {
      const subscription = await stripe.subscriptions.create(subscriptionInfo, req.stripeKey)
      await dashboard.RedisList.add(`subscriptions`, subscription.id)
      await dashboard.RedisList.add(`customer:subscriptions:${req.customer.id}`, subscription.id)
      await dashboard.RedisList.add(`plan:subscriptions:${req.query.planid}`, subscription.id)
      await dashboard.RedisList.add(`product:subscriptions:${req.plan.product}`, subscription.id)
      await dashboard.RedisList.add(`plan:customers:${req.query.planid}`, req.customer.id)
      await dashboard.RedisList.add(`product:customers:${req.plan.product}`, req.customer.id)
      req.success = true
      return subscription
    } catch (error) {
      throw new Error('unknown-error')
    }
  }
}
