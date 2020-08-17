const subscriptions = require('../../../../../index.js')

module.exports = async (stripeEvent, req) => {
  const invoice = stripeEvent.data.object
  const customerid = invoice.customer
  const accountid = invoice.metadata.accountid || await subscriptions.Storage.read(`${req.appid}/map/accountid/customerid/${customerid}`)
  await subscriptions.StorageList.addMany({
    [`${req.appid}/paymentIntentsPendingConfirmation`]: invoice.payment_intent,
    [`${req.appid}/account/paymentIntentsPendingConfirmation/${accountid}`]: invoice.payment_intent
  })
}
