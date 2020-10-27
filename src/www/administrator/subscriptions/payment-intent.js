const dashboard = require('@userdashboard/dashboard')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  if (!req.query || !req.query.paymentintentid) {
    throw new Error('invalid-paymentIntentid')
  }
  const paymentIntent = await global.api.administrator.subscriptions.PaymentIntent.get(req)
  paymentIntent.createdFormatted = dashboard.Format.date(paymentIntent.created)
  paymentIntent.amountFormatted = dashboard.Format.money(paymentIntent.amount_off, paymentIntent.currency)
  req.data = { paymentIntent }
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.html || req.route.html, req.data.paymentIntent, 'payment_intent')
  const removeElements = []
  for (const status of ['requires_payment_method', 'requires_confirmation', 'requires_action', 'processing', 'requires_capture', 'canceled', 'succeeded']) {
    if (req.data.paymentIntent.status !== status) {
      removeElements.push(status)
    }
  }
  for (const id of removeElements) {
    const element = doc.getElementById(id)
    element.parentNode.removeChild(element)
  }
  return dashboard.Response.end(req, res, doc)
}
