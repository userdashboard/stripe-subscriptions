module.exports = {
  before: beforeRequest,
  get: renderPage,
  post: submitForm
}

async function beforeRequest (req) {
  if (!req.query || !req.query.invoiceid) {
    throw new Error('invalid-invoiceid')
  }
  const invoice = await global.api.user.subscriptions.Invoice.get(req)
  if (invoice.paid) {
    throw new Error('invalid-invoice')
  }
  req.data = {invoice}
  if (req.session.lockURL === req.url && req.session.unlocked >= global.dashboard.Timestamp.now) {
    await global.api.user.subscriptions.PayInvoice.patch(req)
  }
}

async function renderPage (req, res, messageTemplate) {
  if (req.success) {
    messageTemplate = 'success'
  }
  const doc = global.dashboard.HTML.parse(req.route.html)
  if (messageTemplate) {
    doc.renderTemplate(null, messageTemplate, 'messageContainer')
    if (messageTemplate === 'success') {
      doc.removeElementById('submitForm')
      return global.dashboard.Response.end(req, res, doc)
    }
  }
  const amount = { amount: req.data.invoice.amount - req.data.invoice.amount_paid }
  doc.renderTemplate(amount, 'amount-template', 'amount-now')
  return global.dashboard.Response.end(req, res, doc)
}

async function submitForm (req, res) {
  if (!req.body) {
    return renderPage(req, res)
  }
  try {
    req.body.sourceid = req.customer.default_source
    await global.api.user.subscriptions.PayInvoice.patch(req)
    if (req.success) {
      return renderPage(req, res, 'success')
    }
    return global.dashboard.Response.redirect(req, res, '/account/authorize')
  } catch (error) {
    return renderPage(req, res, 'unknown-error')
  }
}
