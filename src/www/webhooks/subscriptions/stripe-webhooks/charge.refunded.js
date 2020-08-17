const subscriptions = require('../../../../../index.js')
const stripeCache = require('../../../../stripe-cache.js')

module.exports = async (stripeEvent, req) => {
  const charge = stripeEvent.data.object
  const refund = charge.refunds.data[0]
  const invoice = await stripeCache.execute('invoices', 'retrieve', charge.invoice, req.stripeKey)
  const customerid = charge.customer
  const subscriptionid = invoice.subscription || invoice.lines.data[invoice.lines.data.length - 1].subscription
  const accountid = invoice.metadata.accountid
  const planid = invoice.lines.data[invoice.lines.data.length - 1].plan.id
  const productid = invoice.lines.data[invoice.lines.data.length - 1].plan.product
  await stripeCache.delete(charge.id)
  await stripeCache.delete(refund.id)
  await stripeCache.delete(invoice.id)
  await subscriptions.StorageList.addMany({
    [`${req.appid}/refunds`]: refund.id,
    [`${req.appid}/customer/refunds/${customerid}`]: refund.id,
    [`${req.appid}/plan/refunds/${planid}`]: refund.id,
    [`${req.appid}/product/refunds/${productid}`]: refund.id,
    [`${req.appid}/subscription/refunds/${subscriptionid}`]: refund.id,
    [`${req.appid}/account/refunds/${accountid}`]: refund.id
  })
}
