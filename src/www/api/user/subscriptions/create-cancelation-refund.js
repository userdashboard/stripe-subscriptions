const subscriptions = require('../../../../../index.js')
const stripeCache = require('../../../../stripe-cache.js')

module.exports = {
  post: async (req) => {
    if (!req.query || !req.query.subscriptionid) {
      throw new Error('invalid-subscriptionid')
    }
    const subscription = await global.api.user.subscriptions.Subscription.get(req)
    if (!subscription) {
      throw new Error('invalid-subscriptionid')
    }
    if ((subscription.status !== 'active' && subscription.status !== 'trialing') || subscription.cancel_at_period_end) {
      throw new Error('invalid-subscription')
    }
    req.query.invoiceid = subscription.latest_invoice
    const invoice = await global.api.user.subscriptions.Invoice.get(req)
    if (!invoice.charge) {
      throw new Error('invalid-subscription')
    }
    req.query.chargeid = invoice.charge
    const charge = await global.api.user.subscriptions.Charge.get(req)
    if (!charge) {
      throw new Error('invalid-subscription')
    }
    const zeroed = []
    for (const item of subscription.items.data) {
      zeroed.push({ id: item.id, quantity: 0 })
    }
    const upcoming = await stripeCache.execute('invoices', 'retrieveUpcoming', {
      customer: subscription.customer.id || subscription.customer,
      subscription: req.query.subscriptionid,
      subscription_items: zeroed
    }, req.stripeKey)
    if (upcoming.total === 0) {
      throw new Error('invalid-subscription')
    }
    const refundInfo = {
      charge: invoice.charge,
      amount: -upcoming.total,
      reason: 'requested_by_customer',
      metadata: {
        appid: req.appid,
        accountid: req.account.accountid
      }
    }
    const refund = await stripeCache.execute('refunds', 'create', refundInfo, req.stripeKey)
    await stripeCache.update(refund)
    await subscriptions.StorageList.addMany({
      [`${req.appid}/refunds`]: refund.id,
      [`${req.appid}/paymentMethod/refunds/${charge.payment_method}`]: refund.id,
      [`${req.appid}/customer/refunds/${subscription.customer.id || subscription.customer}`]: refund.id,
      [`${req.appid}/plan/refunds/${subscription.plan.id}`]: refund.id,
      [`${req.appid}/product/refunds/${subscription.plan.product}`]: refund.id,
      [`${req.appid}/account/refunds/${req.account.accountid}`]: refund.id
    })
    return refund
  }
}
