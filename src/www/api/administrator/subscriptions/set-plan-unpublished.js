const dashboard = require('@userdashboard/dashboard')
const subscriptions = require('../../../../../index.js')
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
    if (!plan.metadata.published || plan.metadata.unpublished) {
      throw new Error('invalid-plan')
    }
    const updateInfo = {
      metadata: {
        unpublished: dashboard.Timestamp.now
      }
    }
    const planNow = await stripeCache.execute('plans', 'update', req.query.planid, updateInfo, req.stripeKey)
    await stripeCache.update(planNow)
    await subscriptions.StorageList.remove(`${req.appid}/published/plans`, req.query.planid)
    await subscriptions.StorageList.add(`${req.appid}/unpublished/plans`, req.query.planid)
    return planNow
  }
}
