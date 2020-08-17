const stripeCache = require('../../../../stripe-cache.js')

module.exports = {
  patch: async (req) => {
    if (!req.query || !req.query.subscriptionid) {
      throw new Error('invalid-subscriptionid')
    }
    let subscription = await global.api.user.subscriptions.Subscription.get(req)
    if (!subscription) {
      throw new Error('invalid-subscriptionid')
    }
    if ((subscription.status !== 'active' && subscription.status !== 'trialing') || subscription.cancel_at_period_end) {
      throw new Error('invalid-subscription')
    }
    if (!req.body || !req.body.planid) {
      throw new Error('invalid-planid')
    }
    if (subscription.plan === req.body.planid) {
      throw new Error('invalid-plan')
    }
    if (subscription.plan && subscription.plan.id && subscription.plan.id === req.body.planid) {
      throw new Error('invalid-plan')
    }
    req.query.customerid = subscription.customer.id || subscription.customer
    const customer = await global.api.user.subscriptions.Customer.get(req)
    if (!customer) {
      throw new Error('invalid-customerid')
    }
    req.query.planid = req.body.planid
    const newPlan = await global.api.user.subscriptions.PublishedPlan.get(req)
    if (!newPlan.metadata.published || newPlan.metadata.unpublished) {
      throw new Error('invalid-plan')
    }
    if (newPlan.amount) {
      if (!req.body.paymentmethodid || !req.body.paymentmethodid.length) {
        throw new Error('invalid-paymentmethodid')
      }
      req.query.paymentmethodid = req.body.paymentmethodid
      const paymentMethod = await global.api.user.subscriptions.PaymentMethod.get(req)
      if (!paymentMethod) {
        throw new Error('invalid-paymentmethodid')
      }
    }
    const updateInfo = {
      items: [{
        id: subscription.items.data[0].id,
        plan: req.body.planid
      }]
    }
    // const oldPlan = subscription.plan
    subscription = await stripeCache.execute('subscriptions', 'update', req.query.subscriptionid, updateInfo, req.stripeKey)
    if (!subscription) {
      throw new Error('unknown-error')
    }
    await stripeCache.update(subscription)
    // if (newPlan.amount > oldPlan.amount || newPlan.interval !== oldPlan.interval) {
    //   const upcomingInvoice = await stripeCache.execute('invoices', 'create', {
    //     customer: customer.id,
    //     subscription: subscription.id,
    //     metadata: {
    //       appid: req.appid,
    //       accountid: req.account.accountid
    //     }
    //   }, req.stripeKey)
    //   const upcomingInvoiceNow = await stripeCache.execute('invoices', 'pay', upcomingInvoice.id, {
    //     payment_method: req.body.paymentmethodid
    //   }, req.stripeKey)
    //   await stripeCache.update(upcomingInvoiceNow)
    // }
    return subscription
  }
}
