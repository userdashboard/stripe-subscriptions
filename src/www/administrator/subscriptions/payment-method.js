const dashboard = require('@userdashboard/dashboard')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  if (!req.query || !req.query.paymentmethodid) {
    throw new Error('invalid-paymentMethodid')
  }
  const paymentMethod = await global.api.administrator.subscriptions.PaymentMethod.get(req)
  paymentMethod.createdFormatted = dashboard.Format.date(paymentMethod.created)
  paymentMethod.amountFormatted = dashboard.Format.money(paymentMethod.amount_off, paymentMethod.currency)
  req.data = { paymentMethod }
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.html || req.route.html, req.data.paymentMethod, 'payment_method')
  return dashboard.Response.end(req, res, doc)
}
