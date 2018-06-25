const dashboard = require('@userappstore/dashboard')
module.exports = {
  before: beforeRequest,
  get: renderPage,
  post: submitForm
}

async function beforeRequest (req) {
  if (!req.query || !req.query.invoiceid) {
    throw new Error('invalid-invoiceid')
  }
  if (req.session.lockURL === req.url && req.session.unlocked) {
    await global.api.user.subscriptions.SetChargeRefunded.patch(req)
  }
  const invoice = await global.api.user.subscriptions.Invoice.get(req)
  req.query.chargeid = invoice.charge.id || invoice.charge
  const charge = await global.api.user.subscriptions.Charge.get(req)
  const amount = charge.amount - (charge.amount_refunded || 0)
  req.data = {invoice, charge, amount}
}

async function renderPage (req, res, messageTemplate) {
  if (req.success) {
    messageTemplate = 'success'
  }
  const doc = dashboard.HTML.parse(req.route.html, req.data.invoice, 'invoice')
  if (messageTemplate) {
    dashboard.HTML.renderTemplate(doc, null, messageTemplate, 'message-container')
    if (messageTemplate === 'success') {
      const submitForm = doc.getElementById('submit-form')
      submitForm.parentNode.removeChild(submitForm)
      return dashboard.Response.end(req, res, doc)
    }
  }
  dashboard.HTML.renderTemplate(doc, req.data.charge, 'refund-template', 'refund-now')
  return dashboard.Response.end(req, res, doc)
}

async function submitForm (req, res) {
  if (!req.body) {
    return renderPage(req, res)
  }
  req.query.chargeid = req.data.charge.id
  req.body.amount = req.data.amount
  try {
    await global.api.user.subscriptions.SetChargeRefunded.patch(req)
    if (req.success) {
      return renderPage(req, res, 'success')
    }
    return dashboard.Response.redirect(req, res, '/account/authorize')
  } catch (error) {
    return renderPage(req, res, 'unknown-error')
  }
}
