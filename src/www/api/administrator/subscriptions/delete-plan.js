const subscriptions = require('../../../../../index.js')
const stripeCache = require('../../../../stripe-cache.js')

module.exports = {
  delete: async (req) => {
    if (!req.query || !req.query.planid) {
      throw new Error('invalid-planid')
    }
    const plan = await global.api.administrator.subscriptions.Plan.get(req)
    if (!plan) {
      throw new Error('invalid-planid')
    }
    await stripeCache.execute('plans', 'del', req.query.planid, req.stripeKey)
    await subscriptions.StorageList.remove(`${req.appid}/plans`, req.query.planid)
    if (plan.metadata.unpublished) {
      await subscriptions.StorageList.remove(`${req.appid}/unpublished/plans`, req.query.planid)
    } else if (plan.metadata.published) {
      await subscriptions.StorageList.remove(`${req.appid}/published/plans`, req.query.planid)
    }
    await stripeCache.delete(req.query.planid, req.stripeKey)
    return true
  }
}
