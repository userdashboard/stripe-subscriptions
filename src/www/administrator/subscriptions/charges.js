const dashboard = require('@userappstore/dashboard')
const Navigation = require('./navbar.js')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  const charges = await global.api.administrator.subscriptions.Charges.get(req)
  if (charges && charges.length) {
    for (const charge of charges) {
      charge.amountFormatted = dashboard.Format.money(charge.amount || 0, charge.currency)
      charge.amountRefundedFormatted = dashboard.Format.money(charge.amount_refunded || 0, charge.currency)
      charge.date = dashboard.Timestamp.date(charge.created)
    }
  }
  req.data = {charges}
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.route.html)
  await Navigation.render(req, doc)
  if (req.data.charges && req.data.charges.length) {
    doc.renderTable(req.data.charges, 'charge-row-template', 'charges-table')
  }
  return dashboard.Response.end(req, res, doc)
}
