const dashboard = require('@userappstore/dashboard')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  const payouts = await global.api.administrator.subscriptions.Payouts.get(req)
  req.data = {payouts}
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
  }
  return dashboard.Response.end(req, res, doc)
}
