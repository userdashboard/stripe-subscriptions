const stripeCache = require('../../../../stripe-cache.js')

module.exports = {
  patch: async (req) => {
    if (!req.query || !req.query.planid) {
      throw new Error('invalid-planid')
    }
    const plan = await global.api.administrator.subscriptions.Plan.get(req)
    if (!plan) {
      throw new Error('invalid-planid')
    }
    if (plan.metadata.unpublished) {
      throw new Error('invalid-plan')
    }
    if (req.body && req.body.productid) {
      req.query.productid = req.body.productid
      const product = await global.api.administrator.subscriptions.Product.get(req)
      if (!product) {
        throw new Error('invalid-productid')
      }
      if (!product.metadata.published || product.metadata.unpublished) {
        throw new Error('invalid-product')
      }
    }
    if (req.body && req.body.trial_period_days) {
      try {
        const trialPeriodDays = parseInt(req.body.trial_period_days, 10)
        if (trialPeriodDays.toString() !== req.body.trial_period_days) {
          throw new Error('invalid-trial_period_days')
        }
      } catch (s) {
        throw new Error('invalid-trial_period_days')
      }
    }
    const updateInfo = {}
    if (req.body.productid) {
      updateInfo.product = req.body.productid
    }
    if (req.body.trial_period_days) {
      updateInfo.trial_period_days = req.body.trial_period_days
    }
    const planNow = await stripeCache.execute('plans', 'update', req.query.planid, updateInfo, req.stripeKey)
    await stripeCache.update(planNow)
    return planNow
  }
}
