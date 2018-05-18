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
  req.query.chargeid = invoice.charge.id || invoice.charge
  const charge = await global.api.user.subscriptions.Charge.get(req)
  const amount = charge.amount - (charge.amount_refunded || 0)
  req.data = {invoice, charge, amount}
  if (req.session.lockURL === req.url && req.session.unlocked >= global.dashboard.Timestamp.now) {
    await global.api.user.subscriptions.RefundCharge.patch(req)
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
  doc.renderTemplate(req.data.charge, 'refund-template', 'refund-now')
  return global.dashboard.Response.end(req, res, doc)
}

async function submitForm (req, res) {
  if (!req.body) {
    return renderPage(req, res)
  }
  req.query.chargeid = req.data.charge.id
  req.body.amount = req.data.amount
  try {
    await global.api.user.subscriptions.RefundCharge.patch(req)
    if (req.success) {
      return renderPage(req, res, 'success')
    }
    return global.dashboard.Response.redirect(req, res, '/account/authorize')
  } catch (error) {
    return renderPage(req, res, 'unknown-error')
  }
}
