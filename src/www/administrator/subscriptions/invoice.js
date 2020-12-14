const dashboard = require('@userdashboard/dashboard')
const navbar = require('./navbar-invoice.js')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  if (!req.query || !req.query.invoiceid) {
    throw new Error('invalid-invoiceid')
  }
  const invoice = await global.api.administrator.subscriptions.Invoice.get(req)
  invoice.createdFormatted = dashboard.Format.date(invoice.created)
  invoice.account_balance = invoice.account_balance || 0
  invoice.accountBalanceFormatted = invoice.account_balance < 0 ? dashboard.Format.money(-invoice.account_balance, invoice.currency) : ''
  invoice.email = invoice.email || ''
  invoice.discount = invoice.discount || ''
  invoice.delinquentFormatted = invoice.delinquent ? 'Yes' : 'No'
  invoice.totalFormatted = dashboard.Format.money(invoice.total, invoice.currency)
  invoice.amount_paidFormatted = dashboard.Format.money(invoice.amount_paid, invoice.currency)
  invoice.amount_dueFormatted = dashboard.Format.money(invoice.amount_due, invoice.currency)
  invoice.lines.data[invoice.lines.data.length - 1].period.startFormatted = dashboard.Format.date(invoice.lines.data[invoice.lines.data.length - 1].period.start)
  invoice.lines.data[invoice.lines.data.length - 1].period.endFormatted = dashboard.Format.date(invoice.lines.data[invoice.lines.data.length - 1].period.end)
  req.data = { invoice }
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.html || req.route.html, req.data.invoice, 'invoice')
  navbar.setup(doc, req.data.invoice)
  return dashboard.Response.end(req, res, doc)
}
