const dashboard = require('@userappstore/dashboard')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  const refunds = await global.api.administrator.subscriptions.Refunds.get(req)
  if (refunds && refunds.length) {
    for (const refund of refunds) {
      refund.amountFormatted = dashboard.Format.money(refund.amount || 0, refund.currency)
    }
  }
  req.data = {refunds}
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.route.html)
  if (req.data.refunds && req.data.refunds.length) {
    doc.renderTable(req.data.refunds, 'refund-row-template', 'refunds-table')
  } else {
    doc.removeElementById('refunds-table')
  }
  return dashboard.Response.end(req, res, doc)
}
