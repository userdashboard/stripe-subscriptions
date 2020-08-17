const subscriptions = require('../../../../../index.js')

module.exports = async (stripeEvent, req) => {
  const invoice = stripeEvent.data.object
  if (invoice.status === 'open' && stripeEvent.data.previous_attributes.status === 'draft') {
    const accountid = invoice.metadata.accountid || await subscriptions.Storage.read(`${req.appid}/map/accountid/customerid/${invoice.customer}`)
    await subscriptions.StorageList.addMany({
      [`${req.appid}/openInvoices`]: invoice.id,
      [`${req.appid}/account/openInvoices/${accountid}`]: invoice.id
    })
  }
}
