const dashboard = require('@userappstore/dashboard')
const Navigation = require('./navbar.js')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  const invoices = await global.api.user.subscriptions.Invoices.get(req)
  if (invoices && invoices.length) {
    for (const invoice of invoices) {
      if (invoice.total) {
        invoice.totalFormatted = dashboard.Format.money(invoice.total, invoice.currency)
        invoice.date = dashboard.Timestamp.date(invoice.date)
        invoice.period_start = dashboard.Timestamp.date(invoice.lines.data[0].period.start)
        invoice.period_end = dashboard.Timestamp.date(invoice.lines.data[0].period.end)
        invoice.plan_name = invoice.lines.data[0].plan.name
      }
    }
  }
  req.data = {invoices}
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.route.html)
  await Navigation.render(req, doc)
  if (req.data.invoices && req.data.invoices.length) {
    doc.renderTable(req.data.invoices, 'invoice-row-template', 'invoices-table')
  } else {
    doc.removeElementById('invoices-table')
  }
  return dashboard.Response.end(req, res, doc)
}
