const dashboard = require('@userappstore/dashboard')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  const total = await global.api.administrator.subscriptions.InvoicesCount.get(req)
  const invoices = await global.api.administrator.subscriptions.Invoices.get(req)
  const offset = req.query ? req.query.offset || 0 : 0
  if (invoices && invoices.length) {
    for (const invoice of invoices) {
      invoice.totalFormatted = dashboard.Format.money(invoice.total, invoice.currency)
      invoice.date = dashboard.Timestamp.date(invoice.date)
      invoice.periodStart = dashboard.Timestamp.date(invoice.lines.data[0].period.start)
      invoice.periodEnd = dashboard.Timestamp.date(invoice.lines.data[0].period.end)
      invoice.planName = invoice.lines.data[0].plan.name
      invoice.planid = invoice.lines.data[0].plan.id
    }
  }
  req.data = {invoices, total, offset}
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.route.html)
  if (req.data.invoices && req.data.invoices.length) {
    dashboard.HTML.renderTable(doc, req.data.invoices, 'invoice-row', 'invoices-table')
    if (req.data.count <= global.PAGE_SIZE) {
      const pageLinks = doc.getElementById('page-links')
      pageLinks.parentNode.removeChild(pageLinks)
    } else {
      dashboard.HTML.renderPagination(doc, req.data.offset, req.data.count)
    }
  }
  return dashboard.Response.end(req, res, doc)
}
