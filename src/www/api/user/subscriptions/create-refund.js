const dashboard = require('@userdashboard/dashboard')
const subscriptions = require('../../../../../index.js')
const stripeCache = require('../../../../stripe-cache.js')

module.exports = {
  post: async (req) => {
    if (!req.query || !req.query.chargeid) {
      throw new Error('invalid-chargeid')
    }
    const charge = await global.api.user.subscriptions.Charge.get(req)
    if (!charge.amount || !charge.paid || charge.refunded || !global.subscriptionRefundPeriod ||
      charge.created <= dashboard.Timestamp.now - global.subscriptionRefundPeriod) {
      throw new Error('invalid-charge')
    }
    req.query.invoiceid = charge.invoice
    const invoice = await global.api.user.subscriptions.Invoice.get(req)
    const refundInfo = {
      charge: req.query.chargeid,
      amount: charge.amount - (charge.amount_refunded || 0),
      reason: 'requested_by_customer',
      metadata: {
        appid: req.appid,
        accountid: req.account.accountid
      }
    }
    req.query.subscriptionid = invoice.subscription
    const subscription = await global.api.user.subscriptions.Subscription.get(req)
    if (subscription.status === 'active') {
      const subscriptionNow = await stripeCache.execute('subscriptions', 'del', subscription.id, { prorate: false }, req.stripeKey)
      await stripeCache.update(subscriptionNow)
      await subscriptions.StorageList.remove(`${req.appid}/subscriptions`, subscription.id)
      await subscriptions.StorageList.remove(`${req.appid}/account/subscriptions/${req.account.accountid}`, req.query.subscriptionid)
      await subscriptions.StorageList.remove(`${req.appid}/plan/subscriptions/${subscription.plan.id}`, req.query.subscriptionid)
      await subscriptions.StorageList.remove(`${req.appid}/product/subscriptions/${subscription.plan.product}`, req.query.subscriptionid)
    }
    const refund = await stripeCache.execute('refunds', 'create', refundInfo, req.stripeKey)
    await stripeCache.update(refund)
    return refund
  }
}
