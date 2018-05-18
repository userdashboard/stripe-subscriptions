const Navigation = require('./navbar.js')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  if (!req.query || !req.query.chargeid) {
    throw new Error('invalid-chargeid')
  }
  const charge = await global.api.administrator.subscriptions.Charge.get(req)
  charge.amountFormatted = global.dashboard.Format.money(charge.amount || 0, charge.currency)
  charge.amountRefundedFormatted = global.dashboard.Format.money(charge.amount_refunded || 0, charge.currency)
  charge.date = global.dashboard.Timestamp.date(charge.created)
  charge.dateRelative = global.dashboard.Format.relativePastDate(charge.date)
  req.data = {charge}
}

async function renderPage (req, res) {
  const doc = global.dashboard.HTML.parse(req.route.html)
  await Navigation.render(req, doc)
  doc.renderTemplate(req.data.charge, 'charge-row-template', 'charges-table')
  return global.dashboard.Response.end(req, res, doc)
}
