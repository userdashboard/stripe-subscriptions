const subscriptions = require('../../../../../index.js')
const stripeCache = require('../../../../stripe-cache.js')

module.exports = async (stripeEvent, req) => {
  const invoice = stripeEvent.data.object
  const customerid = invoice.customer
  const subscriptionid = invoice.subscription || invoice.lines.data[invoice.lines.data.length - 1].subscription
  let accountid = invoice.metadata.accountid || await subscriptions.Storage.read(`${req.appid}/map/accountid/customerid/${customerid}`)
  const indexing = {}
  if (!subscriptionid) {
    indexing[`${req.appid}/invoices`] = invoice.id
    indexing[`${req.appid}/customer/invoices/${customerid}`] = invoice.id
    indexing[`${req.appid}/account/invoices/${accountid}`] = invoice.id
  }
  if (invoice.status === 'open') {
    accountid = invoice.metadata.accountid || await subscriptions.Storage.read(`${req.appid}/map/accountid/customerid/${customerid}`)
    indexing[`${req.appid}/openInvoices`] = invoice.id
    indexing[`${req.appid}/account/openInvoices/${accountid}`] = invoice.id
  }
  if (!subscriptionid) {
    await subscriptions.StorageList.addMany(indexing)
    return
  }
  req.query = req.query || {}
  req.query.subscriptionid = subscriptionid
  let subscription
  try {
    subscription = await global.api.administrator.subscriptions.Subscription.get(req)
  } catch (error) {
    return
  }
  const planid = subscription.plan.id
  const productid = subscription.plan.product
  if (!invoice.metadata.appid) {
    const invoiceNow = await stripeCache.execute('invoices', 'update', invoice.id, {
      metadata: {
        appid: req.appid,
        accountid: accountid
      }
    }, req.stripeKey)
    await stripeCache.delete(invoiceNow.id)
  }
  indexing[`${req.appid}/invoices`] = invoice.id
  indexing[`${req.appid}/customer/invoices/${customerid}`] = invoice.id
  indexing[`${req.appid}/plan/invoices/${planid}`] = invoice.id
  indexing[`${req.appid}/product/invoices/${productid}`] = invoice.id
  indexing[`${req.appid}/account/plan/invoices/${planid}/${accountid}`] = invoice.id
  indexing[`${req.appid}/account/product/invoices/${productid}/${accountid}`] = invoice.id
  indexing[`${req.appid}/subscription/invoices/${subscriptionid}`] = invoice.id
  indexing[`${req.appid}/account/invoices/${accountid}`] = invoice.id
  await subscriptions.StorageList.addMany(indexing)
}
