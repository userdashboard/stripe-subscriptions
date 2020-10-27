const dashboard = require('@userdashboard/dashboard')
const navbar = require('./navbar-charge.js')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  if (!req.query || !req.query.chargeid) {
    throw new Error('invalid-chargeid')
  }
  const charge = await global.api.administrator.subscriptions.Charge.get(req)
  charge.amountFormatted = dashboard.Format.money(charge.amount || 0, charge.currency)
  charge.amountRefundedFormatted = dashboard.Format.money(charge.amount_refunded || 0, charge.currency)
  charge.dateFormatted = dashboard.Format.date(charge.created)
  req.data = { charge }
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.html || req.route.html, req.data.charge, 'charge', req.language)
  navbar.setup(doc, req.data.charge)
  return dashboard.Response.end(req, res, doc)
}
