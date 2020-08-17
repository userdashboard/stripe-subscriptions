const dashboard = require('@userdashboard/dashboard')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  const total = await global.api.administrator.subscriptions.RefundRequestsCount.get(req)
  const charges = await global.api.administrator.subscriptions.RefundRequests.get(req)
  const offset = req.query ? req.query.offset || 0 : 0
  if (charges && charges.length) {
    for (const charge of charges) {
      charge.amountFormatted = dashboard.Format.money(charge.amount || 0, charge.currency)
      charge.amountRefundedFormatted = dashboard.Format.money(charge.amount_refunded || 0, charge.currency)
      charge.dateFormatted = dashboard.Format.date(charge.created)
    }
  }
  req.data = { charges, total, offset }
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.route.html, null, null, req.language)
  if (req.data.charges && req.data.charges.length) {
    dashboard.HTML.renderTable(doc, req.data.charges, 'charge-row', 'charges-table')
    if (req.data.total <= global.pageSize) {
      const pageLinks = doc.getElementById('page-links')
      pageLinks.parentNode.removeChild(pageLinks)
    } else {
      dashboard.HTML.renderPagination(doc, req.data.offset, req.data.total)
    }
    const noCharges = doc.getElementById('no-charges')
    noCharges.parentNode.removeChild(noCharges)
  } else {
    const chargesTable = doc.getElementById('charges-table')
    chargesTable.parentNode.removeChild(chargesTable)
  }
  return dashboard.Response.end(req, res, doc)
}
