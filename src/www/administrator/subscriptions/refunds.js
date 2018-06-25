const dashboard = require('@userappstore/dashboard')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  const count = await global.api.administrator.subscriptions.RefundsCount.get(req)
  const refunds = await global.api.administrator.subscriptions.Refunds.get(req)
  const offset = req.query ? req.query.offset || 0 : 0
  if (refunds && refunds.length) {
    for (const refund of refunds) {
      refund.amountFormatted = dashboard.Format.money(refund.amount || 0, refund.currency)
    }
  }
  req.data = {refunds, count, offset}
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.route.html)
  if (req.data.refunds && req.data.refunds.length) {
    dashboard.HTML.renderTable(doc, req.data.refunds, 'refund-row', 'refunds-table')
    if (req.data.count < global.PAGE_SIZE) {
      const pageLinks = doc.getElementById('page-links')
      pageLinks.parentNode.removeChild(pageLinks)
    } else {
      dashboard.HTML.renderPagination(doc, req.data.offset, req.data.count)
    }
  } else {
    const refundsTable = doc.getElementById('refunds-table')
    refundsTable.parentNode.removeChild(refundsTable)
  }
  return dashboard.Response.end(req, res, doc)
}
