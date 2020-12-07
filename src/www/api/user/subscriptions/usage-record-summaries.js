const packageJSON = require('../../../../../package.json')
const subscriptions = require('../../../../../index.js')
const stripe = require('stripe')({
  apiVersion: global.stripeAPIVersion,
  telemetry: false,
  maxNetworkRetries: global.maximumStripeRetries || 0,
  appInfo: {
    version: packageJSON.version,
    name: '@userdashboard/stripe-subscriptions',
    url: 'https://github.com/userdashboard/stripe-subscriptions'
  }
})

module.exports = {
  // TODO: the usage records get aggregated into these summaries
  // but there's currently no way to index and paginate them
  // consistent with other objects
  get: async (req) => {
    if (!req.query || !req.query.subscriptionitemid) {
      throw new Error('invalid-subscriptionitemid')
    }
    // TODO: normally this would be where ownership of the
    // querystring object is verified but the subscription
    // items are not indexed individually
    const listInfo = {}
    if (req.query.ending_before) {
      listInfo.ending_before = req.query.ending_before
    } else if (req.query.starting_after) {
      listInfo.starting_after = req.query.starting_after
    }
    if (req.query.limit) {
      listInfo.limit = parseInt(req.query.limit, 10)
    } else {
      listInfo.limit = global.pageSize
    }
    let records
    try {
      records = await stripe.subscriptionItems.listUsageRecordSummaries(req.query.subscriptionitemid, listInfo, req.stripeKey)
    } catch (error) {
      if (error.message === 'stripe.subscriptionItems.listUsageRecordSummaries is not a function') {
        // TODO: not sure if this is pending a nodejs update
        // or an api-update on Stripe's side but the method
        // is not currently available
        return null
      }
      throw new Error('invalid-subscriptionitemid')
    }
    if (!records || !records.data || !records.data.length) {
      return null
    }
    // TODO: as a fallback for checking ownership the summaries
    // invoice is verified as belonging to the user
    req.query.invoiceid = records.data[0].invoice
    const owned = await subscriptions.StorageList.exists(`${req.appid}/account/invoices/${req.account.accountid}`, records.data[0].invoice)
    if (!owned) {
      throw new Error('invalid-account')
    }
    const invoice = await global.api.user.subscriptions.Invoice.get(req)
    if (!invoice) {
      throw new Error('invalid-subscriptionitemid')
    }
    return records
  }
}
