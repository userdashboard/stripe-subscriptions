const dashboard = require('@userappstore/dashboard')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  if (!req.query || !req.query.invoiceid) {
    throw new Error('invalid-invoiceid')
  }
  const invoice = await global.api.administrator.subscriptions.Invoice.get(req)
  invoice.created = dashboard.Timestamp.date(invoice.created)
  invoice.account_balance = invoice.account_balance || 0
  invoice.accountBalanceFormatted = invoice.account_balance < 0 ? dashboard.Format.money(-invoice.account_balance, invoice.currency) : ''
  invoice.email = invoice.email || ''
  invoice.discount = invoice.discount || ''
  invoice.delinquentFormatted = invoice.delinquent ? 'Yes' : 'No'
  req.data = {invoice}
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.route.html)
  doc.renderTemplate(req.data.invoice, 'invoice-row-template', 'invoices-table')
  return dashboard.Response.end(req, res, doc)
}
