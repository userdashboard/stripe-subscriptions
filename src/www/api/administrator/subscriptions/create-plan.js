const dashboard = require('@userdashboard/dashboard')
const subscriptions = require('../../../../../index.js')
const stripeCache = require('../../../../stripe-cache.js')

module.exports = {
  post: async (req) => {
    if (!req.body || !req.body.planid) {
      throw new Error('invalid-planid')
    }
    if (!req.body.planid.match(/^[a-zA-Z0-9_ ]+$/)) {
      throw new Error('invalid-planid')
    }
    if (global.minimumPlanIDLength > req.body.planid.length ||
      global.maximumPlanIDLength < req.body.planid.length) {
      throw new Error('invalid-planid-length')
    }
    if (!req.body.productid || !req.body.productid.length) {
      throw new Error('invalid-productid')
    }
    if (!req.body.currency || req.body.currency.length !== 3) {
      throw new Error('invalid-currency')
    }
    req.query = req.query || {}
    req.query.productid = req.body.productid
    const product = await global.api.administrator.subscriptions.Product.get(req)
    if (!product) {
      throw new Error('invalid-productid')
    }
    if (!product.metadata.published || product.metadata.unpublished) {
      throw new Error('invalid-product')
    }
    if (req.body.usage_type && req.body.usage_type !== 'metered' && req.body.usage_type !== 'licensed') {
      throw new Error('invalid-usage_type')
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
        const trialPeriodDays = parseInt(req.body.trial_period_days, 10)
        if (trialPeriodDays < 0 || trialPeriodDays > 90) {
          throw new Error('invalid-trial_period_days')
        }
        if (req.body.trial_period_days !== trialPeriodDays.toString()) {
          throw new Error('invalid-trial_period_days')
        }
      } catch (s) {
        throw new Error('invalid-trial_period_days')
      }
    }
    const planInfo = {
      id: req.body.planid,
      product: req.body.productid,
      currency: req.body.currency,
      amount: req.body.amount || 0,
      interval: req.body.interval,
      interval_count: req.body.interval_count || 0,
      trial_period_days: req.body.trial_period_days || 0,
      usage_type: req.body.usage_type || 'licensed',
      metadata: {
        appid: req.appid
      }
    }
    if (req.body.published) {
      planInfo.metadata.published = dashboard.Timestamp.now
    }
    const plan = await stripeCache.execute('plans', 'create', planInfo, req.stripeKey)
    const indexing = {
      [`${req.appid}/plans`]: plan.id
    }
    if (plan.metadata.published) {
      indexing[`${req.appid}/published/plans`] = plan.id
    }
    await subscriptions.StorageList.addMany(indexing)
    return plan
  }
}
