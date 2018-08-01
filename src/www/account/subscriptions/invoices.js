const dashboard = require('@userappstore/dashboard')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  req.query = req.query || {}
  req.query.customerid = req.customer.id
  const total = await global.api.user.subscriptions.InvoicesCount.get(req)
  const invoices = await global.api.user.subscriptions.Invoices.get(req)
  const offset = req.query.offset || 0
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
  } else {
    const invoicesTable = doc.getElementById('invoices-table')
    invoicesTable.parentNode.removeChild(invoicesTable)
  }
  return dashboard.Response.end(req, res, doc)
}
