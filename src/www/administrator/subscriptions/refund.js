const dashboard = require('@userdashboard/dashboard')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  if (!req.query || !req.query.refundid) {
    throw new Error('invalid-refundid')
  }
  const refund = await global.api.administrator.subscriptions.Refund.get(req)
  refund.amountFormatted = dashboard.Format.money(refund.amount || 0, refund.currency)
  req.data = { refund }
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.html || req.route.html, req.data.refund, 'refund', req.language)
  return dashboard.Response.end(req, res, doc)
}
