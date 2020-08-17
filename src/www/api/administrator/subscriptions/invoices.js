const subscriptions = require('../../../../../index.js')

module.exports = {
  get: async (req) => {
    req.query = req.query || {}
    let index
    if (req.query.customerid) {
      index = `${req.appid}/customer/invoices/${req.query.customerid}`
    } else if (req.query.accountid) {
      index = `${req.appid}/account/invoices/${req.query.accountid}`
    } else if (req.query.subscriptionid) {
      index = `${req.appid}/subscription/invoices/${req.query.subscriptionid}`
    } else {
      index = `${req.appid}/invoices`
    }
    let invoiceids
    if (req.query.all) {
      invoiceids = await subscriptions.StorageList.listAll(index)
    } else {
      const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : global.pageSize
      invoiceids = await subscriptions.StorageList.list(index, offset, limit)
    }
    if (!invoiceids || !invoiceids.length) {
      return null
    }
    const items = []
    for (const invoiceid of invoiceids) {
      req.query.invoiceid = invoiceid
      const invoice = await global.api.administrator.subscriptions.Invoice.get(req)
      items.push(invoice)
    }
    return items
  }
}
