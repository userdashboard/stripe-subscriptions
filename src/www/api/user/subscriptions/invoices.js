const subscriptions = require('../../../../../index.js')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.accountid) {
      throw new Error('invalid-accountid')
    }
    const account = await global.api.user.Account.get(req)
    if (!account) {
      throw new Error('invalid-account')
    }
    let index
    if (req.query.customerid) {
      const customer = await global.api.user.subscriptions.Customer.get(req)
      if (!customer) {
        throw new Error('invalid-customerid')
      }
      index = `${req.appid}/customer/invoices/${req.query.customerid}`
    } else {
      index = `${req.appid}/account/invoices/${req.query.accountid}`
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
      const invoice = await global.api.user.subscriptions.Invoice.get(req)
      items.push(invoice)
    }
    return items
  }
}
