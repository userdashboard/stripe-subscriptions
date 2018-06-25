const dashboard = require('@userappstore/dashboard')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  const count = await global.api.administrator.subscriptions.PayoutsCount.get(req)
  const payouts = await global.api.administrator.subscriptions.Payouts.get(req)
  const offset = req.query ? req.query.offset || 0 : 0
  req.data = {payouts, count, offset}
}

async function renderPage (req, res, messageTemplate) {
  const doc = dashboard.HTML.parse(req.route.html)
  if (req.data.payouts && req.data.payouts.length) {
    dashboard.HTML.renderTable(doc, req.data.payouts, 'payout-row', 'payouts-table')
    for (const payout of req.data.payouts) {
      if (payout.failure_code) {
        dashboard.HTML.renderTemplate(doc, null, payout.failure_code, `status-${payout.id}`)
      }
    }
    if (req.data.count < global.PAGE_SIZE) {
      const pageLinks = doc.getElementById('page-links')
      pageLinks.parentNode.removeChild(pageLinks)
    } else {
      dashboard.HTML.renderPagination(doc, req.data.offset, req.data.count)
    }
  }
  return dashboard.Response.end(req, res, doc)
}
