const dashboard = require('@userappstore/dashboard')
const stripe = require('stripe')()

module.exports = {
  lock: true,
  before: async (req) => {
    if (!req.body || !req.body.planid) {
      throw new Error('invalid-planid')
    }
    if (!req.body.planid.match(/^[a-zA-Z0-9 ]+$/)) {
      throw new Error('invalid-planid')
    }
    if (global.MINIMUM_PLAN_LENGTH > req.body.planid.length ||
      global.MAXIMUM_PLAN_LENGTH < req.body.planid.length) {
      throw new Error('invalid-planid-length')
    }
    console.log(req.body)
    if (!req.body.productid) {
      throw new Error('invalid-productid')
    }
    if (!req.body.currency || req.body.currency.length !== 3) {
      throw new Error('invalid-currency')
    }
    let product
    try {
      product = await stripe.products.retrieve(req.body.productid, req.stripeKey)
    } catch (error) {
    }
    if (!product) {
      throw new Error('invalid-productid')
    }
    if (!product.metadata.published || product.metadata.unpublished) {
      throw new Error('invalid-product')
    }
    if (!req.body.amount) {
      throw new Error('invalid-amount')
    }
    try {
      const amount = parseInt(req.body.amount, 10)
      if (req.body.amount !== amount.toString()) {
        throw new Error('invalid-amount')
      }
    } catch (s) {
      throw new Error('invalid-amount')
    }
    if (req.body.amount < 0) {
      throw new Error('invalid-amount')
    }
    if (!req.body.interval_count) {
      throw new Error('invalid-interval_count')
    }
    if (req.body.interval !== 'day' && req.body.interval !== 'week' && req.body.interval !== 'month' && req.body.interval !== 'year') {
      throw new Error('invalid-interval')
    }
    try {
      req.body.interval_count = parseInt(req.body.interval_count, 10)
      if (!req.body.interval_count) {
        throw new Error('invalid-interval_count')
      }
    } catch (s) {
      throw new Error('invalid-interval_count')
    }
    if (req.body.interval_count < 1) {
      throw new Error('invalid-interval_count')
    }
    if (req.body.trial_period_days) {
      try {
        req.body.trial_period_days = parseInt(req.body.trial_period_days, 10)
        if (req.body.trial_period_days !== 0 || (req.body.trial_period_days < 0 || req.body.trial_period_days > 90)) {
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
  post: async (req) => {
    const planInfo = {
      id: req.body.planid,
      product: req.body.productid,
      currency: req.body.currency,
      amount: req.body.amount || 0,
      interval: req.body.interval,
      interval_count: req.body.interval_count || 0,
      trial_period_days: req.body.trial_period_days || 0
    }
    if (req.body.published) {
      planInfo.metadata = {
        published: dashboard.Timestamp.now
      }
    }
    let product
    try {
      product = await stripe.products.retrieve(req.body.productid, req.stripeKey)
    } catch (error) {
    }
    if (!product) {
      throw new Error('invalid-productid')
    }
    if (!product.metadata.published || product.metadata.unpublished) {
      throw new Error('invalid-product')
    }
    try {
      const plan = await stripe.plans.create(planInfo, req.stripeKey)
      req.success = true
      await dashboard.RedisList.add('plans', plan.id)
      if (plan.metadata.published) {
        await dashboard.RedisList.add('published:plans', plan.id)
      }
      return plan
    } catch (error) {
      if (error.message.indexOf('invalid-') === 0) {
        throw error
      }
      if (error.message.indexOf('Invalid currency') === 0) {
        throw new Error('invalid-currency')
      }
      if (error.message.indexOf('No such product') === 0) {
        throw new Error('invalid-product')
      }
      throw new Error('unknown-error')
    }
  }
}
