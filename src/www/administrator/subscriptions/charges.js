const dashboard = require('@userappstore/dashboard')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  const total = await global.api.administrator.subscriptions.ChargesCount.get(req)
  const charges = await global.api.administrator.subscriptions.Charges.get(req)
  const offset = req.query ? req.query.offset || 0 : 0
  if (charges && charges.length) {
    for (const charge of charges) {
      charge.amountFormatted = dashboard.Format.money(charge.amount || 0, charge.currency)
      charge.amountRefundedFormatted = dashboard.Format.money(charge.amount_refunded || 0, charge.currency)
      charge.date = dashboard.Timestamp.date(charge.created)
    }
  }
  req.data = {charges, total, offset}
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.route.html)
  if (req.data.charges && req.data.charges.length) {
    dashboard.HTML.renderTable(doc, req.data.charges, 'charge-row', 'charges-table')
    if (req.data.total <= global.PAGE_SIZE) {
      const pageLinks = doc.getElementById('page-links')
      pageLinks.parentNode.removeChild(pageLinks)
    } else {
      dashboard.HTML.renderPagination(doc, req.data.offset, req.data.total)
    }
  }
  return dashboard.Response.end(req, res, doc)
}
