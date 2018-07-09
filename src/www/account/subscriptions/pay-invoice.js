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
    await global.api.user.subscriptions.SetInvoicePaid.patch(req)
    if (req.success) {
      return
    }
  }
  const invoice = await global.api.user.subscriptions.Invoice.get(req)
  if (invoice.paid) {
    throw new Error('invalid-invoice')
  }
  req.data = {invoice}
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
  const amount = { amount: req.data.invoice.amount - req.data.invoice.amount_paid }
  dashboard.HTML.renderTemplate(doc, amount, 'amount-template', 'amount-now')
  return dashboard.Response.end(req, res, doc)
}

async function submitForm (req, res) {
  if (!req.body) {
    return renderPage(req, res)
  }
  try {
    req.body.sourceid = req.customer.default_source
    await global.api.user.subscriptions.SetInvoicePaid.patch(req)
    if (req.success) {
      return renderPage(req, res, 'success')
    }
    return dashboard.Response.redirect(req, res, '/account/authorize')
  } catch (error) {
    return renderPage(req, res, 'unknown-error')
  }
}
