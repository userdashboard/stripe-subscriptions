const subscriptions = require('../../../../../index.js')
const stripeCache = require('../../../../stripe-cache.js')

module.exports = async (stripeEvent, req) => {
  let charge = stripeEvent.data.object
  const indexing = {
    [`${req.appid}/charges`]: charge.id
  }
  if (charge.customer) {
    const customerid = charge.customer
    req.query = req.query || {}
    req.query.customerid = customerid
    let customer
    try {
      customer = await global.api.administrator.subscriptions.Customer.get(req)
    } catch (error) {
      return
    }
    const accountid = await subscriptions.Storage.read(`${req.appid}/map/accountid/customerid/${customerid}`)
    let invoice = await stripeCache.execute('invoices', 'retrieve', charge.invoice, req.stripeKey)
    if (!invoice.metadata.appid || !invoice.metadata.accountid) {
      invoice = await stripeCache.execute('invoices', 'update', invoice.id, {
        metadata: {
          appid: req.appid,
          accountid: accountid
        }
      }, req.stripeKey)
      await stripeCache.delete(invoice.id)
    }
    const subscriptionid = invoice.subscription || invoice.lines.data[invoice.lines.data.length - 1].subscription
    if (!charge.metadata.appid) {
      charge = await stripeCache.execute('charges', 'update', charge.id, {
        metadata: {
          appid: req.appid,
          accountid: accountid
        }
      }, req.stripeKey)
    }
    req.query.subscriptionid = subscriptionid
    let subscription
    try {
      subscription = await global.api.administrator.subscriptions.Subscription.get(req)
    } catch (error) {
      return
    }
    await stripeCache.delete(charge.id)
    const planid = subscription.plan.id
    const productid = subscription.plan.product
    indexing[`${req.appid}/customer/charges/${customerid}`] = charge.id
    indexing[`${req.appid}/subscription/charges/${subscriptionid}`] = charge.id
    indexing[`${req.appid}/product/charges/${productid}`] = charge.id
    indexing[`${req.appid}/plan/charges/${planid}`] = charge.id
    indexing[`${req.appid}/account/product/charges/${productid}/${accountid}`] = charge.id
    indexing[`${req.appid}/account/plan/charges/${planid}/${accountid}`] = charge.id
    indexing[`${req.appid}/account/charges/${accountid}`] = charge.id
    if ((subscription.discount && subscription.discount.coupon) || (customer.discount && customer.discount.coupon)) {
      const couponid = subscription.discount && subscription.discount.coupon ? subscription.discount.coupon.id : customer.discount.coupon.id
      indexing[`${req.appid}/product/coupons/${subscription.plan.id}`] = couponid
      indexing[`${req.appid}/plan/coupons/${subscription.plan.product}`] = couponid
      indexing[`${req.appid}/coupon/plans/${couponid}`] = subscription.plan.id
      indexing[`${req.appid}/coupon/products/${couponid}`] = subscription.plan.product
      indexing[`${req.appid}/coupon/charges/${couponid}`] = charge.id
      indexing[`${req.appid}/coupon/invoices/${couponid}`] = invoice.id
    }
    await subscriptions.StorageList.remove(`${req.appid}/openInvoices`, invoice.id)
    await subscriptions.StorageList.remove(`${req.appid}/account/openInvoices/${accountid}`, invoice.id)
    await subscriptions.StorageList.addMany(indexing)
  }
}
