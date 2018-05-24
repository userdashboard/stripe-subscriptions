const dashboard = require('@userappstore/dashboard')

module.exports = {
  before: beforeRequest,
  get: renderPage,
  post: submitForm
}

async function beforeRequest (req) {
  if (!req.query || !req.query.chargeid) {
    throw new Error('invalid-chargeid')
  }
  const charge = await global.api.administrator.subscriptions.Charge.get(req)
  if (!charge.paid || !charge.refunded || (charge.fraud_details && charge.fraud_details.user_report === 'fraudulent')) {
    throw new Error('invalid-charge')
  }
  req.data = {charge}
  if (req.session.lockURL === req.url && req.session.unlocked >= dashboard.Timestamp.now) {
    await global.api.administrator.subscriptions.FlagCharge.patch(req)
  }
}

async function renderPage (req, res, messageTemplate) {
  if (req.success) {
    messageTemplate = 'success'
  }
  const doc = dashboard.HTML.parse(req.route.html)
  if (messageTemplate) {
    doc.renderTemplate(null, messageTemplate, 'messageContainer')
    if (messageTemplate === 'success') {
      doc.removeElementById('submitForm')
    }
  }
  doc.renderTemplate(req.data.charge, 'charge-row-template', 'charges-table')
  return dashboard.Response.end(req, res, doc.toString())
}

async function submitForm (req, res) {
  try {
    await global.api.administrator.subscriptions.FlagCharge.patch(req)
    if (req.success) {
      return renderPage(req, res, 'success')
    }
    return dashboard.Response.redirect(req, res, '/account/authorize')
  } catch (error) {
    switch (error.message) {
      case 'invalid-amount':
        return renderPage(req, res, 'invalid-amount')
    }
    return renderPage(req, res, 'unknown-error')
  }
}
