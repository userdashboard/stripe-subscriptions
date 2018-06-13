const RedisListIndex = require('../../../../redis-list-index.js')
const stripe = require('stripe')()

module.exports = {
  lock: true,
  before: async (req) => {
    if (!req.query || !req.query.subscriptionid) {
      throw new Error('invalid-subscriptionid')
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
    if (!subscription) {
      throw new Error('invalid-subscriptionid')
    }
    if (subscription.status === 'deleted' || subscription.cancel_at_period_end) {
      throw new Error('invalid-subscription')
    }
    req.subscription = subscription
    req.body = req.body || {}
  },
  delete: async (req) => {
    const deleteOptions = {
      at_period_end: req.body.refund === 'at_period_end'
    }
    try {
      await stripe.subscriptions.del(req.query.subscriptionid, deleteOptions, req.stripeKey)
      await RedisListIndex.remove(`subscriptions`, req.subscription.id)
      await RedisListIndex.remove(`customer:subscriptions:${req.customer.id}`, req.subscription.id)
      await RedisListIndex.remove(`plan:subscriptions:${req.query.planid}`, req.subscription.id)
      await RedisListIndex.remove(`product:subscriptions:${req.plan.product}`, req.subscription.id)
      req.success = true
    } catch (error) {
      throw new Error('unknown-error')
    }
  }
}
