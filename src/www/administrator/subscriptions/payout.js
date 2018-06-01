const dashboard = require('@userappstore/dashboard')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  if (!req.query || !req.query.payoutid) {
    throw new Error('invalid-payoutid')
  }
  const payout = await global.api.administrator.subscriptions.Payout.get(req)
  req.data = {payout}
}

async function renderPage (req, res, messageTemplate) {
  const doc = dashboard.HTML.parse(req.route.html)
  doc.renderTemplate(req.data.payout, 'payout-row-template', 'payouts-table')
  if (req.data.payout.failure_code) {
    doc.renderTemplate(null, req.data.payout.failure_code, `status-${req.data.payout.id}`)
  }
  return dashboard.Response.end(req, res, doc)
}
