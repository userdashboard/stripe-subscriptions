const stripe = require('stripe')()

module.exports = {
  lock: true,
  before: async (req) => {
    if (!req.query || !req.query.planid) {
      throw new Error('invalid-planid')
    }
    if (!req.body || !req.body.productid) {
      throw new Error('invalid-productid')
    }
    let plan
    try {
      plan = await stripe.plans.retrieve(req.query.planid, req.stripeKey)
    } catch (error) {
      throw new Error('invalid-planid')
    }
    if (!plan) {
      throw new Error('invalid-planid')
    }
    if (plan.metadata.unpublished) {
      throw new Error('invalid-plan')
    }
    let product
    try {
      product = await stripe.products.retrieve(req.body.productid, req.stripeKey)
    } catch (error) {
      throw new Error('invalid-productid')
    }
    if (!product) {
      throw new Error('invalid-productid')
    }
    if (!product.metadata.published || product.metadata.unpublished) {
      throw new Error('invalid-product')
    }
    if (req.body.trial_period_days) {
      try {
        req.body.trial_period_days = parseInt(req.body.trial_period_days, 10)
        if (!req.body.trial_period_days || req.body.trial_period_days < 0 || req.body.trial_period_days > 365) {
          throw new Error('invalid-trial_period_days')
        }
      } catch (s) {
        throw new Error('invalid-trial_period_days')
      }
      if (req.body.trial_period_days < 0 || req.body.trial_period_days > 365) {
        throw new Error('invalid-trial_period_days')
      }
    }
  },
  patch: async (req) => {
    const updateInfo = {}
    if (req.body.productid) {
      updateInfo.product = req.body.productid
    }
    if (req.body.trial_period_days) {
      updateInfo.trial_period_days = req.body.trial_period_days
    }
    try {
      await stripe.plans.update(req.query.planid, updateInfo, req.stripeKey)
      req.success = true
    } catch (error) {
      throw new Error('unknown-error')
    }
  }
}
