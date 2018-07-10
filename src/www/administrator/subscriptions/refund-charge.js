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
  if (req.session.lockURL === req.url && req.session.unlocked) {
    await global.api.administrator.subscriptions.CreateRefund.post(req)
    if (req.success) {
      return
    }
  }
  const charge = await global.api.administrator.subscriptions.Charge.get(req)
  if (!charge.paid || charge.refunded) {
    throw new Error('invalid-charge')
  }
  req.data = {charge}
}

async function renderPage (req, res, messageTemplate) {
  if (req.success) {
    messageTemplate = 'success'
  }
  const doc = dashboard.HTML.parse(req.route.html, req.data.charge, 'charge')
  if (messageTemplate) {
    dashboard.HTML.renderTemplate(doc, null, messageTemplate, 'message-container')
    if (messageTemplate === 'success') {
      const submitForm = doc.getElementById('submit-form')
      submitForm.parentNode.removeChild(submitForm)
    }
  }
  return dashboard.Response.end(req, res, doc.toString())
}

async function submitForm (req, res) {
  try {
    await global.api.administrator.subscriptions.CreateRefund.post(req)
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
