const subscriptions = require('../../../../../index.js')
const stripeCache = require('../../../../stripe-cache.js')

module.exports = async (stripeEvent, req) => {
  const dispute = stripeEvent.data.object
  const charge = await stripeCache.execute('charges', 'retrieve', dispute.charge, req.stripeKey)
  const invoice = await stripeCache.execute('invoices', 'retrieve', charge.invoice, req.stripeKey)
  const disputeNow = await stripeCache.execute('disputes', 'update', dispute.id, { metadata: { appid: req.appid } }, req.stripeKey)
  await stripeCache.delete(disputeNow.charge)
  await stripeCache.delete(charge.id)
  await stripeCache.delete(invoice.id)
  const customerid = charge.customer
  const subscriptionid = invoice.subscription || invoice.lines.data[invoice.lines.data.length - 1].subscription
  const accountid = invoice.metadata.accountid
  const planid = invoice.lines.data[invoice.lines.data.length - 1].plan.id
  const productid = invoice.lines.data[invoice.lines.data.length - 1].plan.product
  await subscriptions.StorageList.addMany({
    [`${req.appid}/disputes`]: dispute.id,
    [`${req.appid}/customer/disputes/${customerid}`]: dispute.id,
    [`${req.appid}/plan/disputes/${planid}`]: dispute.id,
    [`${req.appid}/product/disputes/${productid}`]: dispute.id,
    [`${req.appid}/account/plan/disputes/${planid}/${accountid}`]: dispute.id,
    [`${req.appid}/account/product/disputes/${productid}/${accountid}`]: dispute.id,
    [`${req.appid}/subscription/disputes/${subscriptionid}`]: dispute.id,
    [`${req.appid}/account/invoices/${accountid}`]: dispute.id
  })
}
