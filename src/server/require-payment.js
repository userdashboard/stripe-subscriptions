const dashboard = require('@userdashboard/dashboard')

module.exports = {
  after: async (req, res) => {
    if (!global.requirePayment) {
      return
    }
    if (!req.account) {
      return
    }
    if (req.urlPath === '/account' ||
        req.urlPath === '/administrator' ||
        req.url.startsWith('/public/') ||
        req.url.startsWith('/api/') ||
        req.url.startsWith('/account/') ||
        req.url.startsWith('/administrator/') ||
        req.url.startsWith('/api/')) {
      return
    }
    const queryWas = req.query
    req.query = {
      accountid: req.account.accountid,
      all: true
    }
    const invoices = await global.api.user.subscriptions.Invoices.get(req)
    req.query = queryWas
    if (invoices && invoices.length) {
      for (const invoice of invoices) {
        if (invoice.status === 'open' &&
            invoice.amount_due &&
            invoice.due_date &&
            invoice.due_date <= dashboard.Timestamp.now &&
            !invoice.paid) {
          res.ended = true
          let payInvoiceURL = `/account/subscriptions/pay-invoice?invoiceid=${invoice.id}`
          payInvoiceURL += '&return-url=' + req.url
          return dashboard.Response.redirect(req, res, payInvoiceURL)
        }
      }
    }
  }
}
