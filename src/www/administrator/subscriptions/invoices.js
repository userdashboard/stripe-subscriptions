module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  const invoices = await global.api.administrator.subscriptions.Invoices.get(req)
  if (invoices && invoices.length) {
    for (const invoice of invoices) {
      invoice.totalFormatted = global.dashboard.Format.money(invoice.total, invoice.currency)
      invoice.date = global.dashboard.Timestamp.date(invoice.date)
      invoice.dateRelative = global.dashboard.Format.relativePastDate(invoice.date)
      invoice.periodStart = global.dashboard.Timestamp.date(invoice.lines.data[0].period.start)
      invoice.periodStartRelative = global.dashboard.Format.date(invoice.periodStart)
      invoice.periodEnd = global.dashboard.Timestamp.date(invoice.lines.data[0].period.end)
      invoice.periodEndRelative = global.dashboard.Format.date(invoice.periodEnd)
      invoice.planName = invoice.lines.data[0].plan.name
      invoice.planid = invoice.lines.data[0].plan.id
    }
  }
  req.data = {invoices}
}

async function renderPage (req, res) {
  const doc = global.dashboard.HTML.parse(req.route.html)
  if (req.data.invoices && req.data.invoices.length) {
    doc.renderTable(req.data.invoices, 'invoice-row-template', 'invoices-table')
  }
  return global.dashboard.Response.end(req, res, doc)
}
