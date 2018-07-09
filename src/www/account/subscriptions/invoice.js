const dashboard = require('@userappstore/dashboard')

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
  const doc = dashboard.HTML.parse(req.route.html, req.data.invoice, 'invoice')
  dashboard.HTML.renderTable(doc, req.data.invoice.lines.data, 'line_item-row', 'line_items-table')
  if (req.data.charge && req.data.invoice.total < 0) {
    dashboard.HTML.renderTemplate(doc, req.data.charge, 'refund-row', 'refunds-table')
    const chargeContainer = doc.getElementById('charge-container')
    chargeContainer.parentNode.removeChild(chargeContainer)
  } else {
    dashboard.HTML.renderTemplate(doc, req.data.charge, 'charge-row', 'charges-table')
    const refundContainer = doc.getElementById('refund-container')
    refundContainer.parentNode.removeChild(refundContainer)
  }
  return dashboard.Response.end(req, res, doc)
}
