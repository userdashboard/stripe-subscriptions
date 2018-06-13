const RedisListIndex = require('../../../../redis-list-index.js')
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
    if (!plan || !plan.metadata.published || plan.metadata.unpublished) {
      throw new Error('invalid-plan')
    }
    if (!req.customer.default_source) {
      throw new Error('invalid-source')
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
      await RedisListIndex.add(`subscriptions`, subscription.id)
      await RedisListIndex.add(`customer:subscriptions:${req.customer.id}`, subscription.id)
      await RedisListIndex.add(`plan:subscriptions:${req.query.planid}`, subscription.id)
      await RedisListIndex.add(`product:subscriptions:${req.plan.product}`, subscription.id)
      req.success = true
      return subscription
    } catch (error) {
      throw new Error('unknown-error')
    }
  }
}
