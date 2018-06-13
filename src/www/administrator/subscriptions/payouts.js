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
    doc.renderTable(req.data.payouts, 'payout-row-template', 'payouts-table')
    for (const payout of req.data.payouts) {
      if (payout.failure_code) {
        doc.renderTemplate(null, payout.failure_code, `status-${payout.id}`)
      }
    }
    if (req.data.count < global.PAGE_SIZE) {
      doc.removeElementById('page-links')
    } else {
      doc.renderPagination(req.data.offset, req.data.count)
    }
  }
  return dashboard.Response.end(req, res, doc)
}
