const subscriptions = require('../../../../../index.js')
const stripeCache = require('../../../../stripe-cache.js')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.invoiceid) {
      throw new Error('invalid-invoiceid')
    }
    const exists = await subscriptions.StorageList.exists(`${req.appid}/invoices`, req.query.invoiceid)
    if (!exists) {
      throw new Error('invalid-invoiceid')
    }
    const owned = await subscriptions.StorageList.exists(`${req.appid}/account/invoices/${req.account.accountid}`, req.query.invoiceid)
    if (!owned) {
      throw new Error('invalid-account')
    }
    let invoice
    try {
      invoice = await stripeCache.retrieve(req.query.invoiceid, 'invoices', req.stripeKey)
    } catch (error) {
    }
    if (!invoice) {
      throw new Error('invalid-invoiceid')
    }
    return invoice
  }
}
