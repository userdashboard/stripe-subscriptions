const dashboard = require('@userappstore/dashboard')

module.exports = {
  after: afterAuthentication
}

async function afterAuthentication (req, res) {
  if (!req.account || !req.customer) {
    return
  }
  if (req.url.indexOf('/administrator') === 0 || req.url.indexOf('/account') === 0) {
    return
  }
  const invoices = await global.api.user.subscriptions.Invoices.get(req)
  if (!invoices || !invoices.length) {
    return
  }
  for (const invoice of invoices) {
    if (invoice.closed || invoice.paid || invoice.forgiven || !invoice.amount_remaining) {
      continue
    }
    req.redirect = true
    return dashboard.Response.redirect(req, res, `/account/subscriptions/pay-invoice?invoiceid=${invoice.id}`)
  }
}
