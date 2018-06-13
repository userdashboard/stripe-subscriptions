const dashboard = require('@userappstore/dashboard')
const Navigation = require('./navbar.js')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  const count = await global.api.administrator.subscriptions.CardsCount.get(req)
  const charges = await global.api.administrator.subscriptions.Charges.get(req)
  const offset = req.query ? req.query.offset || 0 : 0
  if (charges && charges.length) {
    for (const charge of charges) {
      charge.amountFormatted = dashboard.Format.money(charge.amount || 0, charge.currency)
      charge.amountRefundedFormatted = dashboard.Format.money(charge.amount_refunded || 0, charge.currency)
      charge.date = dashboard.Timestamp.date(charge.created)
    }
  }
  req.data = {charges, count, offset}
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.route.html)
  await Navigation.render(req, doc)
  if (req.data.charges && req.data.charges.length) {
    doc.renderTable(req.data.charges, 'charge-row-template', 'charges-table')
    if (req.data.count < global.PAGE_SIZE) {
      doc.removeElementById('page-links')
    } else {
      doc.renderPagination(req.data.offset, req.data.count)
    }
  }
  return dashboard.Response.end(req, res, doc)
}
