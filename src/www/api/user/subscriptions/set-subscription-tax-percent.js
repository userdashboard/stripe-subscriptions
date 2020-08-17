const stripeCache = require('../../../../stripe-cache.js')

module.exports = {
  patch: async (req) => {
    if (!req.query || !req.query.subscriptionid) {
      throw new Error('invalid-subscriptionid')
    }
    const subscription = await global.api.user.subscriptions.Subscription.get(req)
    if (!subscription) {
      throw new Error('invalid-subscriptionid')
    }
    if (!req.body || !req.body.tax_percent) {
      throw new Error('invalid-tax_percent')
    }
    let percent = -1
    try {
      percent = parseInt(req.body.tax_percent, 10)
    } catch (error) {
    }
    if (percent < 0 || percent.toString() !== req.body.tax_percent) {
      throw new Error('invalid-tax_percent')
    }
    if (subscription.tax_percent === percent) {
      throw new Error('invalid-tax_percent')
    }
    const updateInfo = {
      tax_percent: req.body.tax_percent
    }
    const subscriptionNow = await stripeCache.execute('subscriptions', 'update', req.query.subscriptionid, updateInfo, req.stripeKey)
    if (!subscriptionNow) {
      throw new Error('unknown-error')
    }
    await stripeCache.update(subscriptionNow)
    return subscriptionNow
  }
}
