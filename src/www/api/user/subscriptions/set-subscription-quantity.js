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
    if (!req.body || !req.body.quantity) {
      throw new Error('invalid-quantity')
    }
    try {
      const quantity = parseInt(req.body.quantity, 10)
      if (quantity < 1 || quantity.toString() !== req.body.quantity) {
        throw new Error('invalid-quantity')
      }
      if (subscription.quantity === quantity) {
        throw new Error('invalid-quantity')
      }
    } catch (error) {
      throw new Error('invalid-quantity')
    }
    // req.query.customerid = subscription.customer.id || subscription.customer
    // const customer = await global.api.user.subscriptions.Customer.get(req)
    const updateInfo = {
      items: [{
        id: subscription.items.data[0].id,
        quantity: req.body.quantity
      }]
    }
    const subscriptionNow = await stripeCache.execute('subscriptions', 'update', req.query.subscriptionid, updateInfo, req.stripeKey)
    if (!subscriptionNow) {
      throw new Error('unknown-error')
    }
    // let upcomingInvoice = await stripeCache.execute('invoices', 'create', {
    //   customer: customer.id,
    //   subscription: subscription.id,
    //   metadata: {
    //     appid: req.appid,
    //     accountid: req.account.accountid
    //   }
    // }, req.stripeKey)
    // const amount = upcomingInvoice.total
    // if (amount > 0) {
    //   upcomingInvoice = await stripeCache.exeecute('invoices', 'pay', upcomingInvoice.id, {
    //     payment_method: req.body.paymentmethodid
    //   }, req.stripeKey)
    //   await stripeCache.update(upcomingInvoice)
    // }
    return subscriptionNow
  }
}
