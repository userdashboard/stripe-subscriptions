const dashboard = require('@userdashboard/dashboard')
const navbar = require('./navbar-charge.js')

module.exports = {
  before: beforeRequest,
  get: renderPage,
  post: submitForm
}

async function beforeRequest (req) {
  if (!req.query || !req.query.chargeid) {
    throw new Error('invalid-chargeid')
  }
  if (req.query.message === 'success') {
    req.data = {
      charge: {
        id: req.query.chargeid,
        object: 'charge',
        fraud_details: {}
      }
    }
    return
  }
  const charge = await global.api.administrator.subscriptions.Charge.get(req)
  charge.amountFormatted = dashboard.Format.money(charge.amount || 0, charge.currency)
  charge.amountRefundedFormatted = dashboard.Format.money(charge.amount_refunded || 0, charge.currency)
  charge.dateFormatted = dashboard.Format.date(charge.created)
  if (!charge.metadata.refundRequested || charge.metadata.refundDenied) {
    throw new Error('invalid-charge')
  }
  req.query.invoiceid = charge.invoice
  const invoice = await global.api.administrator.subscriptions.Invoice.get(req)
  req.data = { charge, invoice }
}

async function renderPage (req, res, messageTemplate) {
  messageTemplate = messageTemplate || (req.query ? req.query.message : null)
  const doc = dashboard.HTML.parse(req.html || req.route.html, req.data.charge, 'charge', req.language)
  navbar.setup(doc, req.data.charge)
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
    await global.api.administrator.subscriptions.SetRefundRequestDenied.patch(req)
  } catch (error) {
    return renderPage(req, res, error.message)
  }
  if (req.query['return-url']) {
    return dashboard.Response.redirect(req, res, req.query['return-url'])
  } else {
    res.writeHead(302, {
      location: `${req.urlPath}?chargeid=${req.query.chargeid}&message=success`
    })
    return res.end()
  }
}
