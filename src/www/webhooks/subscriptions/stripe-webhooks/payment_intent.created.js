const subscriptions = require('../../../../../index.js')
const stripeCache = require('../../../../stripe-cache.js')

module.exports = async (stripeEvent, req) => {
  req.query = req.query || {}
  const paymentIntent = stripeEvent.data.object
  let accountid, invoice
  if (paymentIntent.invoice) {
    invoice = await stripeCache.execute('invoices', 'retrieve', paymentIntent.invoice, req.stripeKey)
  }
  if (invoice && invoice.metadata.accountid) {
    accountid = invoice.metadata.accountid
  } else if (paymentIntent.metadata.accountid) {
    accountid = paymentIntent.metadata.accountid
  } else {
    accountid = await subscriptions.Storage.read(`${req.appid}/map/accountid/customerid/${paymentIntent.customer}`)
  }
  const indexing = {}
  indexing[`${req.appid}/paymentIntents`] = paymentIntent.id
  indexing[`${req.appid}/account/paymentIntents/${accountid}`] = paymentIntent.id
  if (invoice && invoice.status === 'open' && stripeEvent.data.previous_attributes && stripeEvent.data.previous_attributes.status === 'draft') {
    indexing[`${req.appid}/openInvoices`] = invoice.id
    indexing[`${req.appid}/account/openInvoices/${accountid}`] = invoice.id
  }
  await subscriptions.StorageList.addMany(indexing)
  if (paymentIntent.status === 'requires_payment_method') {
    const updatePaymentIntent = {}
    if (!paymentIntent.metadata.appid) {
      updatePaymentIntent.metadata = {
        appid: req.appid,
        accountid: accountid
      }
    }
    const intentNow = await stripeCache.execute('paymentIntents', 'update', paymentIntent.id, updatePaymentIntent, req.stripeKey)
    await stripeCache.update(intentNow)
  }
}
