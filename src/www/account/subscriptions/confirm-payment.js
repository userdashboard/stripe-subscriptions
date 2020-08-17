const dashboard = require('@userdashboard/dashboard')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  if (!req.query || !req.query.invoiceid) {
    throw new Error('invalid-invoiceid')
  }
  const invoice = await global.api.user.subscriptions.Invoice.get(req)
  if (!invoice) {
    throw new Error('invalid-invoiceid')
  }
  if (invoice.paid || !invoice.amount_due || invoice.status !== 'open') {
    throw new Error('invalid-invoice')
  }
  req.query.paymentintentid = invoice.payment_intent
  const paymentIntent = await global.api.user.subscriptions.PaymentIntent.get(req)
  paymentIntent.stripePublishableKey = global.stripePublishableKey
  if (!paymentIntent) {
    throw new Error('invalid-invoice')
  }
  req.data = { paymentIntent }
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.route.html, req.data.paymentIntent, 'payment_intent')
  res.setHeader('content-security-policy',
    'default-src * \'unsafe-inline\'; ' +
  `style-src https://m.stripe.com/ https://m.stripe.network/ https://js.stripe.com/v2/ ${global.dashboardServer}/public/ 'unsafe-inline'; ` +
  `script-src * https://m.stripe.com/ https://m.stripe.network/  https://js.stripe.com/v2/ ${global.dashboardServer}/public/ 'unsafe-inline' 'unsafe-eval'; ` +
  'frame-src https://m.stripe.com/ https://m.stripe.network/  https://js.stripe.com/ \'unsafe-inline\' ; ' +
  'connect-src https://m.stripe.com/ https://m.stripe.network/ https://js.stripe.com/ \'unsafe-inline\' ; ')
  return dashboard.Response.end(req, res, doc)
}
