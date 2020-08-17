const dashboard = require('@userdashboard/dashboard')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  if (!req.query || !req.query.setupintentid) {
    throw new Error('invalid-setupIntentid')
  }
  const setupIntent = await global.api.administrator.subscriptions.SetupIntent.get(req)
  setupIntent.createdFormatted = dashboard.Format.date(setupIntent.created)
  setupIntent.amountFormatted = dashboard.Format.money(setupIntent.amount_off, setupIntent.currency)
  req.data = { setupIntent }
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.route.html, req.data.setupIntent, 'setup_intent')
  const removeElements = []
  for (const status of ['requires_setup_method', 'requires_confirmation', 'requires_action', 'processing', 'requires_capture', 'canceled', 'succeeded']) {
    if (req.data.setupIntent.status !== status) {
      removeElements.push(status)
    }
  }
  for (const id of removeElements) {
    const element = doc.getElementById(id)
    element.parentNode.removeChild(element)
  }
  return dashboard.Response.end(req, res, doc)
}
