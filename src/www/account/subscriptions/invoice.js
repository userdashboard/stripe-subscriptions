const dashboard = require('@userappstore/dashboard')
const Navigation = require('./navbar-invoice-options.js')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  if (!req.query || !req.query.invoiceid) {
    throw new Error('invalid-invoiceid')
  }
  const invoice = await global.api.user.subscriptions.Invoice.get(req)
  invoice.totalFormatted = dashboard.Format.money(invoice.total || 0, invoice.currency)
  invoice.date = dashboard.Timestamp.date(invoice.date)
  invoice.dateFormatted = dashboard.Format.date(invoice.date)
  invoice.discountFormatted = dashboard.Format.money(invoice.discount || 0, invoice.currency)
  for (const line of invoice.lines.data) {
    line.totalFormatted = dashboard.Format.money(line.amount, line.currency)
    line.startFormatted = dashboard.Format.date(dashboard.Timestamp.date(line.period.start))
    line.endFormatted = dashboard.Format.date(dashboard.Timestamp.date(line.period.end))
    line.description = line.description || line.plan.name
  }
  req.data = {invoice}
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.route.html)
  await Navigation.render(req, doc)
  doc.renderTemplate(req.data.invoice, 'invoice-row-template', 'invoices-table')
  doc.renderTable(req.data.invoice.lines.data, 'lineitem-row-template', 'lineitems-table')
  if (req.data.charge && req.data.invoice.total < 0) {
    doc.renderTemplate(req.data.charge, 'refund-row-template', 'refunds-table')
    doc.removeElementById('chargeContainer')
  } else {
    doc.renderTemplate(req.data.charge, 'charge-row-template', 'charges-table')
    doc.removeElementById('refundContainer')
  }
  return dashboard.Response.end(req, res, doc)
}
